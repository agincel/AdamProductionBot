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
    } else if (args[0] == "/roll") {
        if (args.length <= 1 || args[1].indexOf("d") < 0) {
            return await sendMessage("Usage: `/roll XdY`, for example: `/roll 2d20`");
        }
        try {
            let quantity = parseInt(args[1].split("d")[0]);
            let diceSize = parseInt(args[1].split("d")[1]);
            if (quantity == NaN || diceSize == NaN)
                return await sendMessage("Invalid dice quantity or size.");
                
            let results = [];
            let total = 0;
            for (let i = 0; i < Math.abs(quantity); i++) {
                let roll = Math.floor(Math.random() * diceSize) + 1;
                total += roll;
                results.push(roll);
            }
            let ret = "```\nRolling " + quantity.toString() + "d" + diceSize.toString() + (quantity == 1 ? "" : "s") + ":\n";
            let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (let i = 0; i < results.length; i++) {
                ret += "Die " + alphabet[Math.floor(Math.random() * alphabet.length)] + ": " + results[i].toString() + "\n";
            }
            ret += "-----\n";
            ret += "Total: " + total.toString() + "\n```";
            return await sendMessage(ret);
        } catch (e) {
            console.log(e);
            return await sendMessage("There was an error. Unless you gave me some weird input, you should let Adam know.");
        }
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
}

module.exports.handle = handle;
