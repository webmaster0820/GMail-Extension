import $ from 'jquery'
import { getRandomId } from 'utils/actions'

let ComposeView = {
    iSDK: null,
    statusBar: null,
    btnGroup: null,
    init: function () {
        ComposeView.onClickBody();
        InboxSDK.load(1, "sdk_victoryapp_9afe1b8655").then((sdk) => {
            ComposeView.iSDK = sdk;
            ComposeView.addButtons();
        });
    },
    addButtons: function () {
        ComposeView.iSDK.Compose.registerComposeViewHandler((composeView) => {
            let statusBar = composeView.addStatusBar({ height: 50 });
            let composeId = getRandomId();
            ComposeView.btnGroup = statusBar.el;

            ComposeView.addFollowUpBtn(ComposeView.btnGroup, composeId);
        })
    },
    addFollowUpBtn: function (btnGroup, composeId) {
        let followupBtnGroup = $("<div></div>").appendTo(btnGroup);
        let followUpBtn = $(`<div id="followup_btn_${composeId}" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false"
        class="followupBtn T-I J-J5-Ji aoO T-I-atl L3 T-I-Zf-aw2 T-I-ax7 adjacent_left ri_slb" role="button" data-tooltip=""
        data-tooltip-delay="600"
        style="overflow: initial !important;color: #5f6368!important;border: 1px solid #DADCE0!important;background: 0 0!important;">
        <div class="J-J5-Ji ri-label">Follow Up</div>
      </div>`
        ).appendTo(followupBtnGroup);
        followUpBtn.on("click", function (e) {
            console.log(e);
            e.stopPropagation();
            ComposeView.removeUiMenu();
            console.log("click followup btn");
            $(".uiMenu", followupBtnGroup).toggleClass('open');
            $(".uiMenu", followupBtnGroup).focusout(function (e) {
                $(".uiMenu", followupBtnGroup).removeClass("open");
            });
        });
        ComposeView.addMenu({
            prt: followupBtnGroup,
            items: [{
                data: 1,
                tooltip: "Once per day",
                value: "Once per day",
                action: ComposeView.onFollowupBtn
            },
            {
                data: 2,
                tooltip: "Once every 2 days",
                value: "Once every 2 days",
                action: ComposeView.onFollowupBtn
            },
            {
                data: 3,
                tooltip: "Once every 3 days",
                value: "Once every 3 days",
                action: ComposeView.onFollowupBtn
            },
            ],
            composeId: composeId
        });

    },
    addMenu: function (opts) {
        let menu = $(`<div class="J-M asi jQjAxd uiMenu close followup_menu_${opts.composeId}" style="user-select: none;top: -113px;left: 7px;position: absolute !important;z-index: 51000 !important;" role="menu"
        aria-haspopup="true" aria-activedescendant=""><div class="SK AX" style="-webkit-user-select: none; ">`).appendTo(opts.prt)
        opts.items.forEach(item => {
            let mn_btn = $(`<div class="menuitem J-N J-Ks" data-tooltip="${item.tooltip}"
            data-tooltip-delay="1000" role="menuitem" style="-webkit-user-select: none;">${item.value}</div>`).appendTo(menu);
            $(mn_btn).click(function (e) {
                item.action(e, opts.composeId, item.data);
            });
        });
    },
    onMenuButton: function (composeId, itemId) {
    },
    onFollowupBtn: function (action, composeId, itemId) {
        ComposeView.removeUiMenu();
        action.stopPropagation();
        alert(`User clicked follow up button, Compose ID is ${composeId}, Button number is ${itemId} `);
        $(`.followup_${composeId}`).removeClass("open");
    }, onClickBody: function () {
        $('body').on("click", function (e) {
            $(".uiMenu").removeClass("open");
        });
    },
    removeUiMenu: function(){
        $(".uiMenu").removeClass("open");
    }
}

export { ComposeView }
