import platform from 'utils/platform';
import { send } from 'utils/messaging';

const browser = ['chrome', 'opera', 'firefox'].indexOf(platform) > -1 ? chrome : window.browser;

const APP_URL = __goldtime_EXTENSION_CONFIG__.app_url;

export function onPopupOpen(_callback) {
  window.onload = _callback;
}

export function onPopupClose(_callback) {
  window.addEventListener('blur', () => {
    send('popup.blur');
  });
}

export function popupClose() {
  window.close();
}

export function setBadgeNumber(number) {
  browser.browserAction.setBadgeText({ text: `${number}` });
}

export function setBadgeColor(color) {
  browser.browserAction.setBadgeBackgroundColor({ color: color });
}

export function setIcon(icon) {
  const suffix = icon ? `-${icon}` : '';
  if (__goldtime_EXTENSION_CONFIG__.extension == 'msedge') {
    browser.browserAction.setIcon({ path: { "40": `icons/icon40${suffix}.png` } });
  }
  else {
    browser.browserAction.setIcon({
      path: {
        40: `icons/icon40${suffix}.png`,
        128: `icons/icon128${suffix}.png`
      }
    });
  }
}

export function setIconPlaying() {
  setIcon('play');
}

export function setIconPaused() {
  setIcon('pause');
}

export function setIconLoggedOut() {
  setIcon('inactive');
}

export function setIconLoggedIn() {
  setIcon('active');
}

export function getActiveTabUrl(callback) {
  browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    callback(tabs[0] ? tabs[0].url : null);
  });
}

export function opengoldtimeWebsite(callback = () => {}) {
  const appUrl = new URL(APP_URL);
  browser.tabs.query({ currentWindow: true }, function (tabs) {
    const ourTabs = tabs.filter(function(tab) { return tab.url && tab.url.indexOf(appUrl.host) > 0 });
    if (ourTabs.length > 0) {
      browser.tabs.update(ourTabs[0].id, { active: true });
    }
    else {
      browser.tabs.create({ url: appUrl.href });
    }
    callback();
  });
}

export function onBrowserWindowDeactivated(callback) {
  chrome.windows.onFocusChanged.addListener(function(window) {
    if (window == chrome.windows.WINDOW_ID_NONE) {
      callback();
    }
  });
}