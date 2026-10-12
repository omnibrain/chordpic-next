// Run before hydration so persisted appearance does not flash on first paint.
export const colorModeInitScript = `(function(){try{if(localStorage.getItem("color-mode")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})()`;
export const adsInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )cp_ads=(on|off)/);if(m&&m[1]==="off"){document.documentElement.classList.add("ads-off")}}catch(e){}})()`;
export const currencyInitScript = `(function(){try{if(/(?:^|; )cp_cur=eur(?:;|$)/.test(document.cookie)){document.documentElement.classList.add("cur-eur")}}catch(e){}})()`;
