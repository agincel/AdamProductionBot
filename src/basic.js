/*
    basic.js 

    Some simple command replies.
    (C) Adam Gincel - 2018
*/  

const send = require("./send.js");

async function handle(text, platformObject, args, bots) {
    async function sendMessage (text) {
        return await send.genericSendMessage(text, platformObject, bots);
    }
    async function editMessage(text, msg) {
        return await send.genericEditMessage(text, platformObject, bots, msg);
    }

    //command replies
    if (args[0] == "/ping") {
        return await sendMessage("Hello, I am online.");
    }
    else if (args[0] == "/yesorno") {
        if (Math.random() > 0.5)
            return await sendMessage("Yes.");
        else
            return await sendMessage("No.");
    }
    else if (args[0] == "/snail" && args.length > 1) {
        let ret = "";
        for (let i = 1; i < args.length; i++) {
            let foundVowel = false;
            for (let j = 0; j < args[i].length; j++) {
                if ("aeiouy".indexOf(args[i][j]) != -1) {
                    foundVowel = true;
                    ret += "sn" + args[i].slice(j) + " ";
                    break;
                }
            }
            if (!foundVowel)
                ret += "sn" + args[i] + " ";
        }
        return await sendMessage(ret);
    }
}

module.exports.handle = handle;