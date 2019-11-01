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
            <v-btn small text icon @click="share"><v-icon>mdi-share</v-icon></v-btn>
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
import { mapGetters, mapActions } from 'vuex';
import ChordPlayer from "@/mixins/ChordPlayer.js";
import MusicText from "@/mixins/MusicText";
import ChordFingeringFull from "@/components/ChordFingeringFull";
import { randStr } from '../helper/index';
import { settings } from '../config/app';
// import { auth } from '../config/auth';
const sha1 = require('sha1');

export default {
  mixins: [ChordPlayer, MusicText],
  data() {
    return {
      examples: ["C", "Em", "D7", "Cm7/A", "Fmaj7sus2"],
      signature: '',
    };
  },
  components: {
    ChordFingeringFull
  },
  computed: {
    ...mapGetters({
      token: 'auth/token',
      ticket: 'auth/ticket'
    }),
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
    ...mapActions({
      fetchToken: 'auth/fetchToken',
      fetchTicket: 'auth/fetchTicket'
    }),
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
    },
    genSignature(url) {
      const params = {
        noncestr: randStr(),
        timestamp: Number(new Date()),
        jsapi_ticket: this.ticket,
        url: url
      };
      const ordered = [];
      Object.keys(params).sort().forEach(function(key) {
        ordered.push(key + '=' + params[key]);
      });
      let paramStr = ordered.join('&');
      const signature = sha1(paramStr);
      paramStr += `&signature=${signature}`;
      // console.log(paramStr);
      window.wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: params.jsapi_ticket, // 必填，公众号的唯一标识
        timestamp: params.timestamp, // 必填，生成签名的时间戳
        nonceStr: params.noncestr, // 必填，生成签名的随机串
        signature: signature,// 必填，签名
        jsApiList: ['updateAppMessageShareData','updateTimelineShareData'] // 必填，需要使用的JS接口列表
      });
    },
    share() {
      var symbol = this.chord.symbol;
      var permalink = this.permalink;
      window.wx.ready(function() {
        // console.log(symbol, settings.appTitle);
        window.wx.updateAppMessageShareData({ 
          title: settings.appTitle + ' - ' + symbol + ' 和弦指法', // 分享标题
          desc: symbol+ ' 和弦指法图', // 分享描述
          link: permalink, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: '../assets/logo.gif', // 分享图标
          success: function () {
            // 设置成功
            console.log('分享成功');
          }
        })
      })
    }
  },
  created() {
    this.navigate();
    this.fetchToken();
  },
  watch: {
    $route() {
      this.navigate();
    },
    token() {
      this.fetchTicket();
    },
    chord(val) {
      if (val) {
        this.genSignature(this.permalink);
      }
    }
  },
  mounted() {
    
  }
};
</script>
