import $ from 'jQuery'

let ComposeView = {
    iSDK: null,
    statusBar: null,
    btnGroup: null,
    init: function(){
        InboxSDK.load(1,"sdk_victoryapp_9afe1b8655").then((sdk)=>{
            ComposeView.iSDK = sdk;
            ComposeView.addButtons();
        });
    },
    addButtons: function(){
        ComposeView.iSDK.Compose.registerComposeViewHandler((composeView)=>{
            ComposeView.addFollowUpBtn(composeView);
        })
    },
    addFollowUpBtn: function(composeView){
        console.log(composeView);
        let statusBar = composeView.addStatusBar({height:50});
        console.log(statusBar);
    }
}

export {ComposeView}
