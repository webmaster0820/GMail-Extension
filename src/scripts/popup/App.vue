<template>
  <div class="layout">
  </div>
</template>

<script>
import Loading from './components/Loading.vue';

export default {
  data() {
    return { navigated: null };
  },
  components: {
    Loading,
  }
}
</script>

<style scoped>
  .layout {
    height: 100%;
    font-size: 14px;
    display: flex;
    flex-direction: column;
  }
  .footer {
    margin-top: auto;
  }
  .prevent_using {
    pointer-events: none;
    opacity: .3;
  }
  .current-user {
    margin-bottom: 10px;
  }
  .log-out-action:hover {
    text-decoration: underline;
  }
  .loading .lds-spinner {
    zoom: 0.7;
  }
  .logo {
    opacity: .4;
    display: block;
    text-align: center;
    margin-top: 15px;
    margin-bottom: 15px;
    color: #7d90fd;
    text-decoration: none;
    font-size: 16px;
  }
  .logo:hover {
    opacity: .6;
  }
  .logo img {
    width: 110px;
    vertical-align: sub;
  }
  .top-slot a, .bottom-slot a {
    color: #717070;
    text-decoration: none;
    display: block;
    text-align: center;
    margin-top: 10px;
  }
  .top-slot a:hover, .bottom-slot a:hover {
    text-decoration: underline;
  }
</style>

<style>
  @font-face {
    font-family: 'Proxima Nova';
    src: url('fonts/proximanova-reg-webfont.woff2') format('woff2'),
    url('fonts/proximanova-reg-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Proxima Nova';
    src: url('fonts/proximanova-semibold-webfont.woff2') format('woff2'),
    url('fonts/proximanova-semibold-webfont.woff') format('woff');
    font-weight: bold;
    font-style: normal;
  }
  * {
    box-sizing: border-box;
  }
  html, body {
    font-family: 'Proxima Nova';
    background-color: #ffffff;
    margin: 0;
    padding: 0;
    height: 100%;
  }
  body {
    width: 300px;
    min-height: 400px;
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 10px;
  }
  #popup {
    height: 100%;
  }
</style>
