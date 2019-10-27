import axios from 'axios';
import { authConfig } from '../../config';

const SET_TOKEN = 'SET_TOKEN';
const SET_TOKEN_FAILURE = 'SET_TOKEN_FAILURE';
const SET_TICKET = 'SET_TICKET';
const SET_TICKET_FAILURE = 'SET_TICKET_FAILURE';

// const TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token';
const TOKEN_URL = '/api';

export const state = {
  token: window.localStorage.getItem('token'),
  expires_in: 0,
  ticket: window.localStorage.getItem('ticket'),
};

export const mutations = {
  [SET_TOKEN](state, payload) {
    state.token = payload.access_token;
    state.expires_in = payload.expires_in;
    window.localStorage.setItem('token', payload.access_token);
  },
  [SET_TOKEN_FAILURE](state) {
    state.token = '';
    window.localStorage.setItem('token', '');
  },
  [SET_TICKET](state, payload) {
    state.ticket = payload.ticket;
    window.localStorage.setItem('ticket', payload.ticket);
  },
  [SET_TICKET_FAILURE](state) {
    state.ticket = '';
    window.localStorage.setItem('ticket', '');
  }
};

export const actions = {
  saveToken({commit}, token) {
    commit(SET_TOKEN, token);
  },
  async fetchToken({commit}) {
    try {
      // const params = {
      //   grant_type: 'client_credential',
      //   appid: APPID,
      //   secret: APPSECRET
      // };
      const response = await axios.get(`${TOKEN_URL}/token?grant_type=client_credential&appid=${authConfig.APPID}&secret=${authConfig.APPSECRET}`);
      // console.log(response.data);
      if (response.data.access_token && response.data.expires_in) {
        commit(SET_TOKEN, response.data);
      } else {
        commit(SET_TOKEN_FAILURE);
      }
    } catch (e) {
      commit(SET_TOKEN_FAILURE);
    }
  },
  async fetchTicket({commit}) {
    try {
      const token = state.token;
      if (token) {
        const response = await axios.get(`${TOKEN_URL}/ticket/getticket?access_token=${token}&type=jsapi`);
        commit(SET_TICKET, response.data);
      } else {
        commit(SET_TICKET_FAILURE);
      }
    } catch (e) {
      commit(SET_TICKET_FAILURE);
    }
  }
};

export const getters = {
  token: state => state.token,
  ticket: state => state.ticket
};
