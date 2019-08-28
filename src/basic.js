/*
    basic.js 

    Some simple command replies.
    (C) Adam Gincel - 2018
*/  

const send = require("./send.js");
const fs = require("fs");

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
    else if (args[0] == "/tgid") {
	    return await sendMessage(platformObject.server);
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
    } else if (args[0] == "/8ball") {
        let replies = [
            "👀",
            "❤",
            "🤔",
            "🤔🤔🤔🤔🤔",
            "👍",
            "👌",
            "🔥",
            "🙌",
            "🤣",
            "👏",
            "🤢",
            "🤐",
            "😥",
            "😠",
            "😰",
            "😇",
            "🤨",
            "🙃",
            "🎉🎉🎉",
            "🎲",
            "🍆🍆🍆🍆",
            "💔💔💔💔💔",
            "🏃‍💨"
        ];
        return await sendMessage(replies[Math.floor(Math.random() * replies.length)]);
    }
    else if (args[0] == "/broadcast") {
        if (platformObject.name == "AdamZG") {
            let servers = JSON.parse(fs.readFileSync("./telegramChats.json", "utf8"));
            let s = text.substring(args[0].length + 1);
            for (let i = 0; i < servers.length; i++) {
                await send.telegramSendServer(s, servers[i], bots)
            }
            return await sendMessage("Broadcast sent.");
        }
    }
    else if (args[0] == "/help") {
        let ret = "AdamTestBot 4.0 Help\n\n";
        let prefix = platformObject.platform == "telegram" ? "/" : "=";
        ret += prefix + "ping - check if the bot is onine\n";
        ret += prefix + "yesorno - ask the bot a yes or no question\n";
        ret += prefix + "snail - snail people == sneeple\n";
        ret += prefix + "quote - use alone or with a number to pull a quote\n";
        ret += prefix + "likes or " + prefix + "karma  - view your karma\n";
        ret += prefix + "dnd - Get help commands specific to the DnD module!\n";
	    ret += prefix + "blaze - use at 4:20 for up to six points.\n";
	    ret += prefix + "blazetime - use to learn what time I think it is.\n";
	    ret += prefix + "leaderboard - see the blaze leaderboard!\n";
        if (platformObject.platform == "telegram") {
            ret += prefix + "quoteadd - reply to a message with this to add it to a quote database\n";
            ret += prefix + "like or " + prefix + "dislike - reply to a message with these to add/subtract from a user's karma\n";
        } else {
            ret += "React to a recent message with 💬 and it will be added to this server's quote database\n";
            ret += "React to a message with 👍 or 👎 to add/subtract from that user's karma\n";
        }
        return await sendMessage(ret);
    }
    else if (args[0] == "/smalltext") {
        let msgText = text.substring("/smalltext ".length).toLowerCase();

        let alphabet = "abcdefghijklmnopqrstuvwxyz.?!-,;:|/()";
        let smallAlphabet = "ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻ·ˀᵎ⁻,;:|/⁽⁾";

        let translator = {};
        for (let i = 0; i < alphabet.length; i++) {
            translator[alphabet[i]] = smallAlphabet[i];
        }

        let shrunkText = "";
        for (let i = 0; i < msgText.length; i++) {
            if (translator[msgText[i]])
                shrunkText += translator[msgText[i]];
            else    
                shrunkText += msgText[i];
        }

        return await sendMessage(shrunkText);
    }
}

async function admin(text, platformObject, args, bots) {
    async function sendMessage (text) {
        return await send.genericSendMessage(text, platformObject, bots);
    }
    async function editMessage(text, msg) {
        return await send.genericEditMessage(text, platformObject, bots, msg);
    }
    async function sendTelegramServer(text, chat) {
        return await send.telegramSendServer(text, chat, bots);
    }

    if (args[0] == "/send") {
        if (args.length < 3) {
            return await sendMessage("Usage: /send chatId Message");
        }

        let msg = text.substring("/send ".length + args[1].length + 1);

        await sendMessage("Sending:\n\n" + msg);
        return await sendTelegramServer(msg, args[1]);
    }
}

module.exports.handle = handle;
module.exports.admin = admin;
