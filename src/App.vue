<template>
  <v-app>
    <v-app-bar app dark color="purple">
      <v-toolbar-title class="mr-2 headline text-uppercase">
        <span class="mr-2">{{ siteInfo.appTitle }}</span>
      </v-toolbar-title>
      <v-toolbar-items>
        <v-btn text @click="navigate({ name: 'home' })">首页</v-btn>
        <v-btn text @click="navigate({ name: 'chord-lookup' })">指法查询</v-btn>
        <v-btn text @click="navigate({ name: 'metronome' })">节拍器</v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-content>

    <v-footer>
      <v-spacer></v-spacer>
      <div>
        使用了SoundFont技术 &copy;
        <span class="mx-2"
          >Version {{ siteInfo.version }}, Author mkz@<a
            href="http://www.guitarchina.com"
            target="_BLANK"
            >吉他中国</a
          >
          {{ new Date().getFullYear() }}</span
        >
      </div>
    </v-footer>
  </v-app>
</template>

<script>
const version = require("../package.json").version;
import { settings } from "./config/app";

export default {
  name: "App",
  data: () => ({
    siteInfo: {}
  }),
  methods: {
    navigate(name) {
      this.$router.push(name).catch(() => {});
    }
  },
  created() {
    this.siteInfo = Object.assign({}, settings);
    document.title = this.siteInfo.appTitle + "-" + this.siteInfo.appName;
    this.siteInfo.version = version;
  }
};
</script>
