import platform from 'utils/platform';

const browser = ['chrome', 'opera', 'firefox'].indexOf(platform) > -1 ? chrome : window.browser;


export function setIcon(icon) {
    const suffix = icon ? `-${icon}` : '';
    if (__goldtime_EXTENSION_CONFIG__.extension == 'msedge') {
        browser.browserAction.setIcon({ path: { "40": `icons/icon40${suffix}.png` } });
    } else {
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