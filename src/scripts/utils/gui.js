import $ from 'jquery'

let gui = {
    createActionButtonGroup: function(){
        return $('<div></div');
    },
    createActionButton: function(buttonName, composeId, action){
        let button = $(`
            <div id="${buttonName}_${composeId}" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false"
                class="followupBtn T-I J-J5-Ji aoO T-I-atl L3 T-I-Zf-aw2 T-I-ax7 adjacent_left ri_slb" role="button" data-tooltip="" data-tooltip-delay="600"
                style="overflow: initial !important;color: #5f6368!important;border: 1px solid #DADCE0!important;background: 0 0!important;">
                <div class="J-J5-Ji ri-label">Follow Up</div>
            </div>`
        );
        button.on("click", function (e) {
            gui.defaultButtonAction(e,()=>{
                action();
            });
        })
        return button;
    },
    createUiMenu: function( itemName , composeId , items ){
        let menu = $(`<div class="J-M asi jQjAxd uiMenu close ${itemName}_menu_${composeId}" style="user-select: none;top: -113px;left: 7px;position: absolute !important;z-index: 51000 !important;" role="menu"
        aria-haspopup="true" aria-activedescendant=""><div class="SK AX" style="-webkit-user-select: none; ">`);
        items.forEach(item => {
            let mn_btn = $(`<div class="menuitem J-N J-Ks" data-tooltip="${item.tooltip}"
            data-tooltip-delay="1000" role="menuitem" style="-webkit-user-select: none;">${item.value}</div>`).appendTo(menu);
            $(mn_btn).click(function (e) {
                gui.defaultButtonAction(e,()=>{
                    item.action(composeId, item.data );
                });
            });
        });
        return menu;
    },
    defaultButtonAction: function(event,action){
        event.stopPropagation();
        $(".uiMenu").removeClass("open");
        action();
    }
}
export default gui;