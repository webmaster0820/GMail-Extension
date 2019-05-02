import debounce from 'lodash.debounce';
import md5 from 'js-md5';
import { send, listen } from 'utils/messaging';
import omit from 'lodash.omit';

const CURRENT_HREF = window.location.href;
const OBSERVED_ELEMENTS = {};

let CONFIG = {};

let MUTATION_OBSERVER;

function runMutationObserver() {
  MUTATION_OBSERVER = new MutationObserver(function(mutations) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(node => {
      });
    });
  });
  MUTATION_OBSERVER.observe(document.body, { childList: true, subtree: true });
}

function stopMutationObserver() {
  if (! MUTATION_OBSERVER) return;
  MUTATION_OBSERVER.disconnect();
}

const debouncedOnFocusChange = debounce((nowInFocus) => {
  send(nowInFocus ? 'contentscript.focus' : 'contentscript.blur', { href: CURRENT_HREF });
}, 10);

function initActiveStateObserving() {
  let wasInFocus = null;
  function onFocusChange(focusOverride) {
    const nowInFocus = focusOverride || document.hasFocus();
    if (wasInFocus !== nowInFocus) {
      debouncedOnFocusChange(nowInFocus);
      wasInFocus = nowInFocus;
    }
  }
  setInterval(onFocusChange, 500);
  window.addEventListener('focus', () => onFocusChange(true));
  window.addEventListener('blur', () => onFocusChange(false));
}

if (window.top == window) {
  window.addEventListener('load', () => {
    runMutationObserver();
    initActiveStateObserving();
  });

  window.addEventListener('beforeunload', function(event) {
    send('contentscript.unload', { href: CURRENT_HREF });
  });
}

window.addEventListener('load', () => {
  alert("open windows")
  send('contentscript.load', {
    model: {
      href: CURRENT_HREF,
      topWindow: window.top == window,
      children: [...document.querySelectorAll('iframe')].map(iframe => { return { href: iframe.src } })
    }
  });
  
}, false);