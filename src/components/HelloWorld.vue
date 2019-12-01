<template>
  <v-container>
    <v-layout text-center wrap>
      <v-flex xs12>
        <v-img
          :src="require('../assets/guitarchina.logo.png')"
          class="my-3"
          contain
          height="100"
        ></v-img>
      </v-flex>

      <v-flex my-4 class="grey--text darken-4">
        <p class="font-weight-bold mb-3">欢迎使用{{ appname }}</p>
        <p class="subheading font-weight-regular">
          在这里您可以查询吉他和弦指法图，
          <br />还可以听一下该和弦的声音 <br /><span class="purple--text"
            >新增功能：节拍器</span
          >
          <br />
          <v-btn
            x-large
            rounded
            color="success"
            class="my-4"
            :to="{ name: 'chord-lookup' }"
            >和弦指法查询</v-btn
          >
          <v-btn
            x-large
            rounded
            outlined
            class="my-4 ml-3"
            color="indigo"
            :to="{ name: 'metronome' }"
            >节拍器</v-btn
          >
        </p>
      </v-flex>

      <v-flex mb-5 xs12 class="grey--text darken-4">
        <h2 class="headline font-weight-bold mb-3">下一个计划是?</h2>

        <v-layout justify-center>
          微信小程序版本正在开发中......
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { settings } from "../config/app";

export default {
  data: () => ({
    appname: ""
  }),
  mounted() {
    this.appname = settings.appName;
  }
};
</script>
