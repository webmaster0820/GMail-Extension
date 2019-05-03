import md5 from 'js-md5';
// import $ from 'jquery'
import {ComposeView} from 'core/ComposeView'

const CURRENT_HREF = window.location.href;

function initApp(){
  console.log("start1");
  ComposeView.init();
}

$(document).ready(function(e){
  setTimeout(()=>{
    initApp();
  },1000)
});

