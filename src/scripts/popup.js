import isUndefined from 'lodash.isundefined';
import platform from 'utils/platform';
import { onPopupOpen, onPopupClose, opengoldtimeWebsite, popupClose } from 'utils/actions';
import { send, listen } from 'utils/messaging';
import Vue from 'vue';
import App from './popup/App.vue';

const DATA = { serverCheckin: null, navigated: null, user: null, companies: [], balances: [], videos: [], loading: true, errors: {} };

new Vue({
  el: '#popup',
  data: DATA,
  components: { App },
  methods: {
    loginRequest(event) {
      const { target: form } = event;
      send('popup.request.login', { login: form.login.value, password: form.password.value });
    },
    logoutRequest() {
      send('popup.request.logout');
    },
    openWebsite() {
      opengoldtimeWebsite(() => popupClose());
    },
    navigate(screen) {
      this.navigated = screen;
    },
    isScreenActive(screen) {
      if (this.navigated) {
        return screen == this.navigated;        
      }
      switch (screen) {
        case 'profile': return this.videos.length == 0;
        case 'videos': return this.videos.length > 0;
      }
    },
    setActiveCompanyId(companyId) {
      send('popup.request.switch_company', { company_id: companyId })
      this.navigate('profile');
    },
  }
});

onPopupOpen(() => {
  DATA.loading = true;
  DATA.navigated = null;
  send('popup.focus');
});

onPopupClose(() => {
  // popupClose();
  send('popup.blur');
});

listen('popup.state', (state) => {
  DATA.loading = !! state.loading;
  DATA.serverCheckin = !isUndefined(state.serverCheckin) ? state.serverCheckin : DATA.serverCheckin;
  DATA.user = !isUndefined(state.user) ? state.user : DATA.user;
  DATA.companies = !isUndefined(state.companies) ? state.companies : DATA.companies;
  DATA.balances = !isUndefined(state.balances) ? state.balances : DATA.balances;
  DATA.videos = !isUndefined(state.videos) ? state.videos : DATA.videos;
  DATA.errors = !isUndefined(state.errors) ? state.errors : {};
});

if (platform === 'safari_deprecated') {
  safari.self.width = 300;
  const layout = document.getElementById('popup')
  setInterval(() => {
    const desiredHeight = document.body.clientHeight + 20;
    if (desiredHeight !== safari.self.height) {
      safari.self.height = desiredHeight;
    }
  }, 300);
}

if (platform == 'safari') {
  send('popup.focus');
}

/**
 * Connect LiveReload for development purposes
 */
if (platform == 'chrome' && __goldtime_EXTENSION_CONFIG__.env === 'development') {
  const script = document.createElement('script');
  script.src = 'scripts/livereload.js';
  document.head.appendChild(script);
}