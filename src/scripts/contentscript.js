import md5 from 'js-md5';

const CURRENT_HREF = window.location.href;





window.addEventListener('load', () => {
    send('contentscript.load', {
        model: {
            href: CURRENT_HREF,
            topWindow: window.top == window,
            children: [...document.querySelectorAll('iframe')].map(iframe => { return { href: iframe.src } })
        }
    });

}, false);