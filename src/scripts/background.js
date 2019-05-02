import platform from 'utils/platform';
import md5 from 'js-md5';
import { send, listen } from 'utils/messaging';
import { trackWatching, flushWatching } from 'utils/watching';
import { 
  getActiveTabUrl,
  onBrowserWindowDeactivated,
  setIconLoggedIn,
  setIconLoggedOut,
  setIconPaused,
  setIconPlaying,
} from 'utils/actions';
import {
  getTopWindowHref,
  getVideosByHref,
  getActivePageHref,
  isTopWindowHref,
  onPageChange,
  setCurrentActiveHref,
  registerContentPage,
  unregisterContentPage,
} from 'utils/pages';
import {
  isLoading as apiRequestInProgress,
} from 'utils/api';
import { getVideos } from './utils/pages';

const STORAGE_LOGIN_KEY = 'goldtime.extension.login';
const STORAGE_PASSWORD_KEY = 'goldtime.extension.password';


/**
 * Do some actions required on page change
 */
onPageChange((page) => {
})

/**
 * Subscribe to events of Window (not tab) focus lost.
 * Sometimes tab is not reporting about focus lost.
 */
onBrowserWindowDeactivated(() => {
  setCurrentActiveHref(null)
});

/**
 * Sometimes (new tab is opened) events about page change are not delivered.
 * We checking current page periodically to ensure we're tracking on active page.
 */
setInterval(checkCurrentPage, 5000);

/**
 * Content script injected into page or frame (iframe)
 */
listen('contentscript.load', function(payload) {
  registerContentPage(payload);
  if (isTopWindowHref(payload.model.href)) {
    setCurrentActiveHref(payload.model.href);
    send(`contentscript.config.${md5(payload.model.href)}`, __goldtime_EXTENSION_CONFIG__);
  }
});

/**
 * Content script reporting page is closed
 */
listen('contentscript.unload', function(payload) {
  unregisterContentPage(payload);
  setTimeout(checkCurrentPage, 10);
});

/**
 * Content script reporting it's focused
 */
listen('contentscript.focus', function(payload) {
  getActiveTabUrl((url) => {
    if (payload.href == url) {
      setCurrentActiveHref(url);
    }
  });
});

/**
 * Content script reporting focus is lost
 */
listen('contentscript.blur', function(payload) {
  setTimeout(checkCurrentPage, 10);
});

function wipePreservedPopupForm() {
  localStorage.removeItem(STORAGE_LOGIN_KEY);
  localStorage.removeItem(STORAGE_PASSWORD_KEY);
}

/**
 * Ask browser what page is currently active and syncronize with out pages state
 */
function checkCurrentPage() {
  getActiveTabUrl((url) => {
    setCurrentActiveHref(url, true);
  });
}



/**
 * Update state of video (playing/paused)
 */
function onVideoEvent(event) {
  const { state, video } = event;
  setVideoPlayingState(state, video);
}

/**
 * Connect LiveReload for development purposes
 */
if (platform == 'chrome' && __goldtime_EXTENSION_CONFIG__.env === 'development') {
  const script = document.createElement('script');
  script.src = 'scripts/livereload.js';
  document.head.appendChild(script);
}