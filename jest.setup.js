// jsdom ships no TextEncoder/TextDecoder, but react-dom/server — pulled in
// transitively by @magic-translate/react — reaches for them at module load.
const { TextDecoder, TextEncoder } = require("util");

global.TextEncoder = global.TextEncoder ?? TextEncoder;
global.TextDecoder = global.TextDecoder ?? TextDecoder;
