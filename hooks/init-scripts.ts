import { ADS_COOKIE } from "../services/feature-flags";

/**
 * Inline scripts for the document head, kept apart from the hooks they belong
 * to: the layout that renders them is a server component, and importing a
 * module that also exports a `useState` hook into one is a build error.
 *
 * Both run before paint, which is the whole point — they exist to stop a flash
 * of the light theme and of ad slots that should be hidden.
 */
export const COLOR_MODE_STORAGE_KEY = "color-mode";

export const colorModeInitScript = `(function(){try{if(localStorage.getItem("${COLOR_MODE_STORAGE_KEY}")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})()`;

export const adsInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${ADS_COOKIE}=(on|off)/);if(m&&m[1]==="off"){document.documentElement.classList.add("ads-off")}}catch(e){}})()`;
