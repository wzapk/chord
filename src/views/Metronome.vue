<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="12" md="6">
        <v-card :elevation="4">
          <v-toolbar flat dense>
            <v-toolbar-title>
              <span class="subheading">节拍器</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>mdi-share-variant</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <v-row>
              <v-col :xs="6">
                <h4 class="tempo">
                  {{ tempo }}
                  <small class="ml-1">BPM</small>
                </h4>
              </v-col>
              <v-col :xs="6" class="text-right">
                <v-btn
                  class="mx-3"
                  :class="{ 'v-avatar--metronome': isPlaying }"
                  :style="{
                    animationDuration: animationDuration
                  }"
                  fab
                  dark
                  large
                  color="purple"
                  @click="play()"
                >
                  <v-icon>{{ isPlaying ? "mdi-pause" : "mdi-play" }}</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-slider
                  v-model="tempo"
                  track-color="grey"
                  always-dirty
                  :min="MIN_TEMPO"
                  :max="MAX_TEMPO"
                >
                  <template v-slot:prepend>
                    <v-icon @click="decrement">
                      mdi-minus
                    </v-icon>
                  </template>

                  <template v-slot:append>
                    <v-icon @click="increment">
                      mdi-plus
                    </v-icon>
                  </template>
                </v-slider>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import WebAudioScheduler from 'web-audio-scheduler';
import MetronomeWorker from "worker-loader!@/mixins/metronome.worker.js";

export default {
  data() {
    return {
      status: "Start",
      audioContext: null,
      isPlaying: false, // Are we currently playing?
      unlocked: false,
      startTime: 0, // The start time of the entire sequence.
      current16thNote: 0, // What note is currently last scheduled?
      tempo: 120.0, // tempo (in beats per minute)
      lookahead: 25.0, // How frequently to call scheduling function
      //(in milliseconds)
      scheduleAheadTime: 0.1, // How far ahead to schedule audio (sec)
      // This is calculated from lookahead, and overlaps
      // with next interval (in case the timer is late)
      nextNoteTime: 0.0, // when the next note is due.
      noteResolution: 2, // 0 == 16th, 1 == 8th, 2 == quarter note
      noteResolutionOptions: [
        { text: "4分音符 Quarter notes", value: 2 },
        { text: "8分音符 8th note", value: 1 },
        { text: "16分音符 16th notes", value: 0 }
      ],
      noteLength: 0.05, // length of "beep" (in seconds)
      // canvas: null, // the canvas element
      // canvasContext: null, // canvasContext is the canvas' context 2D
      // last16thNoteDrawn: -1, // the last "box" we drew on the screen
      notesInQueue: [], // the notes that have been put into the web audio,
      // and may or may not have played yet. {note, time}
      timerWorker: null, // The Web Worker used to fire timer messages
      MAX_TEMPO: 240.0,
      MIN_TEMPO: 40.0
    };
  },
  methods: {
    increment() {
      this.tempo += 10;
      if (this.tempo > this.MAX_TEMPO) {
        this.tempo = this.MAX_TEMPO;
      }
    },
    decrement() {
      this.tempo -= 10;
      if (this.tempo < this.MIN_TEMPO) {
        this.tempo = this.MIN_TEMPO;
      }
    },
    nextNote() {
      // Advance current note and time by a 16th note...
      const secondsPerBeat = 60.0 / this.tempo; // Notice this picks up the CURRENT
      // tempo value to calculate beat length.
      this.nextNoteTime += 0.25 * secondsPerBeat; // Add beat length to last beat time

      this.current16thNote++; // Advance the beat number, wrap to zero
      if (this.current16thNote == 16) {
        this.current16thNote = 0;
      }
    },

    scheduleNote(beatNumber, time) {
      // push the note on the queue, even if we're not playing.
      this.notesInQueue.push({ note: beatNumber, time: time });

      if (this.noteResolution == 1 && beatNumber % 2) return; // we're not playing non-8th 16th notes
      if (this.noteResolution == 2 && beatNumber % 4) return; // we're not playing non-quarter 8th notes

      // create an oscillator
      const osc = this.audioContext.createOscillator();
      osc.connect(this.audioContext.destination);
      if (beatNumber % 16 === 0)
        // beat 0 == high pitch
        osc.frequency.value = 880.0;
      else if (beatNumber % 4 === 0)
        // quarter notes = medium pitch
        osc.frequency.value = 440.0;
      // other 16th notes = low pitch
      else osc.frequency.value = 220.0;

      osc.start(time);
      osc.stop(time + this.noteLength);
    },

    scheduler() {
      // while there are notes that will need to play before the next interval,
      // schedule them and advance the pointer.
      while (
        this.nextNoteTime <
        this.audioContext.currentTime + this.scheduleAheadTime
      ) {
        this.scheduleNote(this.current16thNote, this.nextNoteTime);
        this.nextNote();
      }
    },

    play() {
      if (!this.unlocked) {
        // play silent buffer to unlock the audio
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const node = this.audioContext.createBufferSource();
        node.buffer = buffer;
        node.start(0);
        this.unlocked = true;
      }

      this.isPlaying = !this.isPlaying;

      if (this.isPlaying) {
        // start playing
        this.current16thNote = 0;
        this.nextNoteTime = this.audioContext.currentTime;
        this.timerWorker.postMessage("start");
        return "stop";
      } else {
        this.timerWorker.postMessage("stop");
        return "play";
      }
    },

    // resetCanvas() {
    //   // resize the canvas - but remember - this clears the canvas too.
    //   this.canvas.width = window.innerWidth;
    //   this.canvas.height = window.innerHeight;

    //   //make sure we scroll to the top left.
    //   window.scrollTo(0, 0);
    // },

    // draw() {
    //   var currentNote = this.last16thNoteDrawn;
    //   var currentTime = this.audioContext.currentTime;

    //   while (
    //     this.notesInQueue.length &&
    //     this.notesInQueue[0].time < currentTime
    //   ) {
    //     currentNote = this.notesInQueue[0].note;
    //     this.notesInQueue.splice(0, 1); // remove note from queue
    //   }

    //   // We only need to draw if the note has moved.
    //   if (this.last16thNoteDrawn != currentNote) {
    //     var x = Math.floor(this.canvas.width / 18);
    //     this.canvasContext.clearRect(
    //       0,
    //       0,
    //       this.canvas.width,
    //       this.canvas.height
    //     );
    //     for (var i = 0; i < 16; i++) {
    //       this.canvasContext.fillStyle =
    //         currentNote == i
    //           ? currentNote % 4 === 0
    //             ? "red"
    //             : "blue"
    //           : "black";
    //       this.canvasContext.fillRect(x * (i + 1), x, x / 2, x / 2);
    //     }
    //     this.last16thNoteDrawn = currentNote;
    //   }

    //   // set up to draw again
    //   window.requestAnimFrame(this.draw);
    // },

    init() {
      // const container = document.createElement("div");
      // const container = document.getElementById('canvas-1')
      const self = this;

      // container.className = "canvas-container";
      // this.canvas = document.createElement("canvas");
      // this.canvasContext = this.canvas.getContext("2d");
      // this.canvas.width = window.innerWidth;
      // this.canvas.height = window.innerHeight;
      // // document.body.appendChild(container);
      // container.appendChild(this.canvas);
      // this.canvasContext.strokeStyle = "#ffffff";
      // this.canvasContext.lineWidth = 2;

      // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
      // Http://cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js
      // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
      // spec-compliant, and work on Chrome, Safari and Firefox.

      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // if we wanted to load audio files, etc., this is where we should do it.

      // window.onorientationchange = this.resetCanvas;
      // window.onresize = this.resetCanvas;

      // window.requestAnimFrame(this.draw); // start the drawing loop.

      // this.timerWorker = new Worker("js/metronomeworker.js");
      this.timerWorker = new MetronomeWorker();

      this.timerWorker.onmessage = function(e) {
        if (e.data == "tick") {
          // console.log("tick!");
          self.scheduler();
        }
        // else console.log("message: " + e.data);
      };
      this.timerWorker.postMessage({ interval: this.lookahead });
    }
  },
  mounted() {
    // First, let's shim the requestAnimationFrame API, with a setTimeout fallback
    window.requestAnimFrame = (function() {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        }
      );
    })();
    // window.addEventListener("load", this.init);
    this.init();
  },
  computed: {
    animationDuration() {
      return `${60 / this.tempo}s`;
    }
  },
  watch: {
    isPlaying(val) {
      if (val) {
        this.status = "Stop";
      } else {
        this.status = "Start";
      }
    },
    $route() {
      this.timerWorker.postMessage("stop");
      this.isPlaying = false;
    }
  },
  beforeDestroy() {
    this.timerWorker.postMessage("stop");
  }
};
</script>

<style scoped>
.tempo {
  color: rgba(0, 0, 0, 0.87);
  display: inline-block;
  font-size: 48px;
  font-weight: 500;
  line-height: 48px;
  padding-top: 10px;
}
.tempo small {
  color: rgba(0, 0, 0, 0.54);
  display: inline-block;
  font-size: 14px;
  font-weight: 400;
  text-transform: uppercase;
}
@keyframes metronome-tip {
  from {
    transform: scale(0.9);
  }

  to {
    transform: scale(1);
  }
}

.v-avatar--metronome {
  animation-name: metronome-tip;
  animation-iteration-count: infinite;
  animation-direction: normal;
  transform: 0.5;
}
</style>
