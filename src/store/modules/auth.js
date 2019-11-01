import axios from 'axios';
import { authConfig } from '../../config/auth';

const SET_TOKEN = 'SET_TOKEN';
const SET_TOKEN_FAILURE = 'SET_TOKEN_FAILURE';
const SET_TICKET = 'SET_TICKET';
const SET_TICKET_FAILURE = 'SET_TICKET_FAILURE';

// const TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token';
const TOKEN_URL = '/api';

export const state = {
  token: {
    v: JSON.parse(window.localStorage.getItem('token')),
    expires_in: 0,
    created: 0
  },
  ticket: {
    v: JSON.parse(window.localStorage.getItem('ticket')),
    expires_in: 0,
    created: 0
  }
};

export const mutations = {
  [SET_TOKEN](state, payload) {
    state.token = Object.assign({}, {
      v: payload.access_token,
      expires_in: payload.expires_in,
      created: Number(new Date())
    });
    window.localStorage.setItem('token', JSON.stringify(state.token));
  },
  [SET_TOKEN_FAILURE](state) {
    state.token = Object.assign({}, {
      v: '',
      expires_in: 0,
      created: 0
    });
    window.localStorage.setItem('token', JSON.stringify(state.token));
  },
  [SET_TICKET](state, payload) {
    state.ticket = Object.assign({}, {
      v: payload.ticket,
      expires_in: payload.expires_in,
      created: Number(new Date())
    });
    window.localStorage.setItem('ticket', JSON.stringify(state.ticket));
  },
  [SET_TICKET_FAILURE](state) {
    state.ticket = Object.assign({}, {
      v: '',
      expires_in: 0,
      created: 0
    });
    window.localStorage.setItem('tiekct', JSON.stringify(state.ticket));
  }
};

export const actions = {
  async fetchToken({commit}) {
    try {
      const token =JSON.parse(window.localStorage.getItem('token'));
      const timestamp = Number(new Date());
      if (!token || token.created + token.expires_in > timestamp) {
        const response = await axios.get(`${TOKEN_URL}/token?grant_type=client_credential&appid=${authConfig.APPID}&secret=${authConfig.APPSECRET}`);
        // console.log(response.data);
        if (response.data.access_token && response.data.expires_in) {
          commit(SET_TOKEN, response.data);
        } else {
          commit(SET_TOKEN_FAILURE);
        }
      } else {
        commit(SET_TOKEN, {access_token: token.v, expires_in: token.expires_in});
      }
    } catch (e) {
      commit(SET_TOKEN_FAILURE);
    }
  },
  async fetchTicket({commit}) {
    try {
      const token = state.token;
      const ticket = JSON.parse(window.localStorage.getItem('ticket'));
      const timestamp = Number(new Date());
      if (token && (!ticket || ticket.expires_in + ticket.created > timestamp)) {
        const response = await axios.get(`${TOKEN_URL}/ticket/getticket?access_token=${token.v}&type=jsapi`);
        commit(SET_TICKET, response.data);
      } else {
        commit(SET_TICKET, {ticket: ticket.v, expires_in: ticket.expires_in});
      }
    } catch (e) {
      commit(SET_TICKET_FAILURE);
    }
  }
};

export const getters = {
  token: state => state.token.v,
  ticket: state => state.ticket.v
};
