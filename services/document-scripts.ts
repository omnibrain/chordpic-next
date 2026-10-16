// Run before hydration so persisted appearance does not flash on first paint.
export const colorModeInitScript = `(function(){try{if(localStorage.getItem("color-mode")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})()`;
export const adsInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )cp_ads=(on|off)/);if(m&&m[1]==="off"){document.documentElement.classList.add("ads-off")}}catch(e){}})()`;
export const currencyInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )cp_cur=(eur|chf)(?:;|$)/);if(m){document.documentElement.classList.add("cur-"+m[1])}}catch(e){}})()`;

// Google Translate swaps text nodes for its own <font> wrappers, so React later removes or inserts
// next to nodes that are no longer where it left them and crashes the page. Skip those calls.
// https://github.com/facebook/react/issues/11538#issuecomment-417504600
export const translateGuardScript = `(function(){var p=Node.prototype,r=p.removeChild,i=p.insertBefore;p.removeChild=function(c){if(c.parentNode!==this){return c}return r.apply(this,arguments)};p.insertBefore=function(n,ref){if(ref&&ref.parentNode!==this){return n}return i.apply(this,arguments)}})()`;
