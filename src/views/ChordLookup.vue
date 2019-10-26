<template>
  <v-container>
    <v-card :elevation="4">
      <v-card-text>
        <v-row>
          <v-col sm="12">
            <v-text-field
              v-model="chordSearch"
              label="输入要查询的和弦名称"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="12" md="2">
            <v-select
              v-model="instrument"
              :items="instruments"
              return-object
              item-text="label"
              item-value="name"
              label="选择乐器"
            ></v-select>
          </v-col>
          <v-col sm="12" md="2">
            <v-select
              v-model="tuning"
              :items="tunings"
              return-object
              item-text="label"
              item-value="value"
              label="调弦类型"
            ></v-select>
          </v-col>
          <v-col sm="12" md="2">
            <v-checkbox
              v-model="chordSearchCaseSensitive"
              label="区分大小写"
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-row>
      <v-col>
        <div v-if="chord">
          <div class="float-left">
            本页固定链接(permalink)：<span class="blue--text">{{
              permalink
            }}</span>
          </div>
          <div class="float-right">
            点击和弦图，会发生什么事情？
          </div>
        </div>
      </v-col>
    </v-row>

    <transition name="fade" mode="out-in">
      <v-row v-if="!chord">
        <v-col>
          <h3 class="headline">输入一个和弦名称，查询它的和弦图。</h3>
          <p>例如</p>
          <ul>
            <li v-for="example of examples" :key="example">
              <router-link :to="getRouterLink(example)">{{
                example
              }}</router-link>
            </li>
          </ul>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col sm="12" md="4">
          <h2>
            {{ formatNote(chord.symbol) }}
          </h2>
          {{ chord.description }}
        </v-col>

        <v-col sm="12" md="4">
          <table>
            <tr>
              <td>别名：</td>
              <td>
                <v-chip small v-for="(symbol, i) of chord.symbols" :key="i">{{
                  symbol
                }}</v-chip>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <v-chip
                  small
                  v-for="(symbol, i) of chord.altSymbols"
                  :key="i"
                  >{{ symbol }}</v-chip
                >
              </td>
            </tr>
          </table>
        </v-col>

        <v-col sm="12" md="4">
          <table>
            <tr>
              <td>音符：</td>
              <td v-for="n in chord.notes" :key="n">
                <v-chip small class="mr-1">{{ formatNote(n) }}</v-chip>
              </td>
            </tr>
            <tr>
              <td>音程：</td>
              <td
                v-for="i in intervals"
                :key="i.interval"
                :class="{ optional: i.optional }"
              >
                <v-chip small class="mr-1">{{ i.interval }}</v-chip>
              </td>
            </tr>
          </table>
        </v-col>

        <v-col
          sm="12"
          md="4"
          lg="2"
          v-for="(chordFingering, i) in chordFingerings"
          :key="i"
        >
          <ChordFingeringFull
            :chordSymbol="chord.symbol"
            :chordFingering="chordFingering"
            :tuning="tuning"
            @play="onFingeringClicked(i)"
          />
        </v-col>
      </v-row>
    </transition>
  </v-container>
</template>

<script>
import ChordPlayer from "@/mixins/ChordPlayer.js";
import MusicText from "@/mixins/MusicText";
import ChordFingeringFull from "@/components/ChordFingeringFull";

export default {
  mixins: [ChordPlayer, MusicText],
  data() {
    return {
      examples: ["C", "Em", "D7", "Cm7/A", "Fmaj7sus2"]
    };
  },
  components: {
    ChordFingeringFull
  },
  computed: {
    intervals() {
      const optInt = this.chord.optionalIntervals;
      return this.chord.intervals.map(interval => ({
        interval,
        optional: optInt.includes(interval)
      }));
    },
    permalink() {
      return this.chord ? this.getLink(this.chord.symbol) : "";
    }
  },
  methods: {
    navigate() {
      const search = this.$route.params.chordSearch;
      if (search) {
        this.chordSearch = decodeURI(search);
      } else {
        this.chordSearch = "";
        this.chordEntry = null;
      }
    },
    getLink(symbol) {
      const uri = this.getRouterLink(symbol).replace(/\/\//g, "/");
      return window.location.host + uri;
    },
    getRouterLink(symbol) {
      const url = "/lookup/";
      return url + encodeURIComponent(symbol);
    }
  },
  created() {
    this.navigate();
  },
  watch: {
    $route() {
      this.navigate();
    }
  },
  mounted() {}
};
</script>
