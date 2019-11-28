<template>
  <v-container>
    <v-card :elevation="4">
      <v-btn @click="play">{{status}}</v-btn>
    </v-card>
  </v-container>
</template>

<script>
import WebAudioScheduler from 'web-audio-scheduler';

export default {
  data() {
    return {
      status: 'Play',
      audioContext: null,
      sched: null,
      masterGain: null,
      isPlay: false,
    }
  },
  methods: {
    metronome(e) {
      var t0 = e.playbackTime;

      this.sched.insert(t0 + 0.000, this.ticktack, { frequency: 880, duration: 1.0 });
      this.sched.insert(t0 + 0.500, this.ticktack, { frequency: 440, duration: 0.2 });
      this.sched.insert(t0 + 1.000, this.ticktack, { frequency: 440, duration: 0.2 });
      this.sched.insert(t0 + 1.500, this.ticktack, { frequency: 440, duration: 0.2 });
      this.sched.insert(t0 + 2.000, this.metronome);
    },
    ticktack(e) {
      var t0 = e.playbackTime;
      var t1 = t0 + e.args.duration;
      var osc = this.audioContext.createOscillator();
      var amp = this.audioContext.createGain();

      osc.frequency.value = e.args.frequency;
      osc.start(t0);
      osc.stop(t1);
      osc.connect(amp);

      amp.gain.setValueAtTime(0.5, t0);
      amp.gain.exponentialRampToValueAtTime(1e-6, t1);
      amp.connect(this.masterGain);

      this.sched.nextTick(t1, function() {
        osc.disconnect();
        amp.disconnect();
      });
    },
    start() {
      this.sched.start(this.metronome);
    },
    stop() {
      this.sched.stop(true);
    },
    play() {
      this.isPlay = true;
    }
  },
  mounted() {
    // const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.sched = new WebAudioScheduler({conetxt: this.audioContext});
    this.sched.on('start', function() {
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination)
    });
    this.sched.on('stop', function() {
      this.masterGain.disconnect();
      this.masterGain = null;
    });
  },
  watch: {
    isPlay(val) {
      if (val) {
        this.start();
        this.status = 'Stop';
      } else {
        this.stop();
        this.status = 'Play';
      }
    }
  }
}
</script>