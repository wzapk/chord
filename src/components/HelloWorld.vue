<template>
  <v-container>
    <v-layout text-center wrap>
      <v-flex xs12>
        <v-img
          :src="require('../assets/logo.gif')"
          class="my-3"
          contain
          height="150"
        ></v-img>
      </v-flex>

      <v-flex my-4 class="grey--text darken-4">
        <h1 class="display-2 font-weight-bold mb-3">
          欢迎使用和弦图表库
        </h1>
        <p class="subheading font-weight-regular">
          在这里您可以查询吉他和弦指法图，
          <br />还可以听一下该和弦的声音
          <br />
          <router-link :to="{ name: 'chord-lookup' }"
            >现在就开始使用</router-link
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
export default {
  data: () => ({
    //
  })
};
</script>
