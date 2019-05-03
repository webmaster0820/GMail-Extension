import debounce from 'lodash.debounce';
import md5 from 'js-md5';
import { send, listen, getRandomId } from 'utils/messaging';
import omit from 'lodash.omit';
import { getCanvasScope, uiButton, findSendButton, uiMenu } from 'utils/gui'
import { GME } from 'utils/api'
import $ from "jquery";

const CURRENT_HREF = window.location.href;
const OBSERVED_ELEMENTS = {};

let CONFIG = {};

let MUTATION_OBSERVER;

// Global variables

function runMutationObserver() {
    MUTATION_OBSERVER = new MutationObserver(function(mutations) {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(node => {});
        });
    });
    MUTATION_OBSERVER.observe(document.body, { childList: true, subtree: true });
}

function stopMutationObserver() {
    if (!MUTATION_OBSERVER) return;
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

function onFollowupBtn(composeId, itmeId) {
    alert(composeId);
}


function addButtonGroup() {
    console.log("reload");
    console.log($(".dW.E:not(.GME_buttonAdded),.aDj:not(.GME_buttonAdded)"));
    var container = $(".dW.E:not(.GME_buttonAdded),.aDj:not(.GME_buttonAdded)");
    if (container.length > 0) {
        container.addClass('GME_buttonAdded');
        var GME_ID = getRandomId();
        var sendButton = findSendButton(container);
        if ((sendButton.text().toLowerCase().indexOf('send')) !== -1) {
            sendButton.css('width', '12ex').text('Send Now').css('text-transform', 'capitalize');
        }
        var btnGroup = $("<div class='GME_buttonsrow GME_buttonsrow" + GME_ID + "'><span id='" + GME_ID + "'></span></div>").insertAfter(sendButton.closest('.aDh'));
        var followup = $('<div id="followup_GME_' + GME_ID + '" class="GME_button T-I J-J5-Ji aoO T-I-atl L3 T-I-Zf-aw2 adjacent_left GME_slb GME_button_align T-I-ax7" role="button" data-tooltip="" data-tooltip-delay="800" style="">  <div class="J-J5-Ji ri-label">Follow Up</div> </div>').appendTo(btnGroup);
        uiMenu({
            prt: followup,
            items: [{
                    data: 1,
                    tooltip: "Once per day",
                    value: "Once per day",
                    action: onFollowupBtn
                },
                {
                    data: 2,
                    tooltip: "Once every 2 days",
                    value: "Once every 2 days",
                    action: onFollowupBtn
                },
                {
                    data: 3,
                    tooltip: "Once every 3 days",
                    value: "Once every 3 days",
                    action: onFollowupBtn
                },
            ],
            composeId: GME_ID
        });
    }
}

function initActiveExtension() {
    if (GME.intervals.placeButtons == null) {
        GME.intervals.placeButtons = setInterval(() => {
            addButtonGroup();
        }, 1000);
    }
}

if (window.top == window) {
    window.addEventListener('load', () => {
        initActiveExtension();
        runMutationObserver();
        initActiveStateObserving();
    });

    window.addEventListener('beforeunload', function(event) {
        send('contentscript.unload', { href: CURRENT_HREF });
    });
}

window.addEventListener('load', () => {
    send('contentscript.load', {
        model: {
            href: CURRENT_HREF,
            topWindow: window.top == window,
            children: [...document.querySelectorAll('iframe')].map(iframe => { return { href: iframe.src } })
        }
    });

}, false);