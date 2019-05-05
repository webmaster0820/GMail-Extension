import isUndefined from 'lodash.isundefined';
import Vue from 'vue';
import App from './popup/App.vue';

const DATA = { };

new Vue({
  el: '#popup',
  data: DATA,
  components: { App },
});
