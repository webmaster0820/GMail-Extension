import $ from 'jquery'
import { getRandomId } from 'utils/actions'
import gui from 'utils/gui'
import CONST from 'core/constant'

let ComposeView = {
    iSDK: null,
    statusBar: null,
    btnGroup: null,
    composeId: null,
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
            ComposeView.composeId = getRandomId();
            ComposeView.btnGroup = statusBar.el;

            ComposeView.addFollowUpBtn(ComposeView.btnGroup, ComposeView.composeId);
        })
    },
    addFollowUpBtn: function (btnGroup, composeId) {
        let followupBtnGroup = gui.createActionButtonGroup().appendTo(btnGroup);
        gui.createActionButton(CONST.FOLLOWUP_BTN, composeId, () => {
            $(".uiMenu", followupBtnGroup).toggleClass('open');
        }).appendTo(followupBtnGroup);

        gui.createUiMenu(CONST.FOLLOWUP_MENU, composeId,
            [{
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
            ]
        ).appendTo(followupBtnGroup);

    },
    onFollowupBtn: function ( composeId, itemId) {
        alert(`User clicked follow up button, Compose ID is ${composeId}, Button number is ${itemId} `);
        $(`.followup_${composeId}`).removeClass("open");
    },
    onClickBody: function () {
        $('body').on("click", function (e) {
            $(".uiMenu").removeClass("open");
        });
    },
}

export { ComposeView }
