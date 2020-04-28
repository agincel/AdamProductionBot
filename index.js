/*
    AdamTestBot 4.0 
    Re-re-re-rewritten from scratch again as a Discord & Telegram Bot 
    (C) Adam Gincel - 2018
*/
const fs = require("fs");

const Telegram = require('node-telegram-bot-api'); //telegram
const telegramToken = fs.readFileSync("./telegramToken.txt", "utf8").replace("\n", "");
const TelegramBot = new Telegram(telegramToken, {polling: true});

const Discord = require("discord.js"); //discord
const DiscordBot = new Discord.Client();
const discordToken = fs.readFileSync("./discordToken.txt", "utf8").replace("\n", "");
DiscordBot.login(discordToken);

if (!fs.existsSync("./telegramChats.json"))
	fs.writeFileSync("./telegramChats.json", "[]", "utf8");
let telegramChats = JSON.parse(fs.readFileSync("./telegramChats.json", "utf8"));

const timeZoneOffset = 0; //change for daylight savings time, right now UTC-4


let acceptingMessages = false;
setTimeout(function() {
	acceptingMessages = true;
	console.log("Bot is now accepting messages.");
}, 3000);

//include from /src/
const basic = require("./src/basic.js");
const quote = require("./src/quote.js");
const likes = require("./src/likes.js");
const blaze = require("./src/blaze.js");
const dnd = require("./src/dnd.js");

//load dnd db
const dndIO = require("./src/dnd/dndIO.js");
dndIO.load();

DiscordBot.on('ready', () => {
    console.log(`Discord is logged in as ${DiscordBot.user.tag}!`);
});

async function genericSendMessage(text, platformObject) {
    if (platformObject.platform == "telegram") {
        let ret = await TelegramBot.sendMessage(parseInt(platformObject.server), text, {parse_mode: "Markdown"});
        return ret;
    } else {
        let ret = await parameters.msg.channel.send(text);
        return ret;
    }
}

async function genericEditMessage(text, platformObject, msg) {
    if (platformObject.platform == "telegram") {
        return await TelegramBot.editMessageText(text, {chat_id: msg.chat.id, message_id: msg.message_id, parse_mode: "Markdown"});
    } else {
        return await msg.edit(text);
    }
}

async function handleMessage(text, platformObject, args) {
    async function sendMessage (text) {
        return await genericSendMessage(text, platformObject);
    }
    async function editMessage(text, msg) {
        return await genericEditMessage(text, platformObject, msg);
    }

    let bots = {telegram: TelegramBot, discord: DiscordBot};
    await basic.handle(text, platformObject, args, bots);
    await quote.handle(text, platformObject, args, platformObject.msg.reply_to_message, bots);
    await likes.handle(args, platformObject, platformObject.replyID ? platformObject.msg.reply_to_message.from.id.toString() : null, bots);
    await blaze.handle(text, platformObject, args, bots);
    let dndMessage = await dnd.handle(text, platformObject, args, bots);
    if (dndMessage) {
        // sent a dnd message. Check for nickname change.
        console.log("did get dnd message, time to check for nickname update.");
        await dnd.updateNickname(platformObject);
    }
    if (platformObject.name == "AdamZG") { //telegram admin
        await basic.admin(text, platformObject, args, bots);
    }
}


DiscordBot.on('message', async (msg) => {
    if (acceptingMessages) {
        console.log("Discord from " + msg.author.username + ": " + msg.content);
        let args = msg.content.toLowerCase().split(" ");
        
        if (args[0][0] == "=") 
            args[0] = args[0].replace("=", "/"); //if they said =test, make it /test -- done to not use / notation for discord bc that's bad
        else if (args[0][0] == "/")
            args[0] = args[0].split("/")[1]; //remove a prefix / if they typed it for something else, effectively disabling / notation on discord as intended

        let mentions = [];
        let arr = msg.mentions && msg.mentions.users && msg.mentions.users.array();
        for (let i = 0; arr && i < arr.length; i++) {
            let u = arr[i];
            mentions.push({
                "id": u.id,
                "username": u.username
            });
        }

        let platformObject = {
            platform: "discord",
            msg: msg,
            msgID: msg.id,
            replyID: null,
            name: msg.author.username,
            userID: msg.author.id,
            server: msg.guild ? msg.guild.id : msg.author.id,
            time: msg.createdTimestamp + timeZoneOffset,
            mentions: mentions
        }
 	    //console.log(new Date(platformObject.time));       
        return await handleMessage(msg.content, platformObject, args);
    } else {
        console.log("Skipping discord message: " + msg.content);
        return null;
    }
});

DiscordBot.on("messageReactionAdd", async (messageReaction, user) => {
    console.log(messageReaction.emoji.name);
    if (messageReaction.emoji.name == "💬") {
        //if reacting with :speech_balloon: add to quotes
        let platformObject = {
            platform: "discord",
            msg: messageReaction.message,
            msgID: messageReaction.message.id,
            replyID: messageReaction.message.id,
            name: user.username,
            userID: user.id,
            server: messageReaction.message.guild ? messageReaction.message.guild.id : messageReaction.message.author.id
        };

        let messageToQuote = { //emulate the telegram message structure for simplicity later on
            text: messageReaction.message.content,
            from: {
                username: messageReaction.message.author.username
            }
        };
        let bots = {telegram: TelegramBot, discord: DiscordBot};

        await quote.handle("", platformObject, ["/quoteadd"], messageToQuote, bots);
    } else if (messageReaction.emoji.name == "👍" || messageReaction.emoji.name == "👎") {
        //a like
        let platformObject = {
            platform: "discord",
            msg: messageReaction.message,
            msgID: messageReaction.message.id,
            replyID: messageReaction.message.id,
            name: user.username,
            userID: user.id,
            server: messageReaction.message.guild.id
        };

        let bots = {telegram: TelegramBot, discord: DiscordBot};
        await likes.handle([messageReaction.emoji.name == "👍" ? "/like" : "/dislike"], platformObject, messageReaction.message.author.id, bots);
    }
});

TelegramBot.on('message', async (msg) => {
    if (acceptingMessages && msg.text) {
        const chatId = msg.chat.id;
        console.log("Telegram from " + msg.from.first_name + " (" + (msg.from.username ? msg.from.username : msg.from.last_name ? msg.from.last_name : "") + "): " + msg.text);
        let args = msg.text.toLowerCase().split(" ");
        if (args[0].indexOf("@") > -1) 
            args[0] = args[0].split("@")[0]; //change /command@BotUserName to /command, really should check for equality with username
        if (args[0].startsWith("=")) { //make discord commands work with telegram bc why not
            args[0] = "/" + args[0].substring(1);
        }
        
        let mentions = [];
        for (let i = 0; msg.entities && i < msg.entities.length; i++) {
            if (msg.entities[i].user) {
                let u = msg.entities[i].user;
                mentions.push({
                    "id": u.id,
                    "username": u.username ? u.username : u.first_name + (u.last_name ? " " + u.last_name : "")
                });
            } else if (msg.entities[i].type == "mention") {
                let u = msg.text.substr(msg.entities[i].offset + 1, msg.entities[i].length - 1);
                let mentionedUser = dndIO.getUserByUsername(u);
                if (mentionedUser) {
                    mentions.push({
                        "id": mentionedUser.id,
                        "username": u
                    });
                }
            }
        }

        let platformObject = {
            platform: "telegram",
            msg: msg,
            msgID: msg.message_id.toString(),
            replyID: msg.reply_to_message ? msg.reply_to_message.message_id.toString() : null,
            name: msg.from.username ? msg.from.username : msg.from.first_name + (msg.from.last_name ? " " + msg.from.last_name : ""),
            userID: msg.from.id.toString(),
            server: msg.chat.id.toString(),
            time: (msg.date * 1000) + timeZoneOffset,
            mentions: mentions
        }

        if (telegramChats.indexOf(platformObject.server) == -1) {
            telegramChats.push(platformObject.server);
            fs.writeFileSync("./telegramChats.json", JSON.stringify(telegramChats), "utf8");
        }

        return await handleMessage(msg.text, platformObject, args);
    } else if (msg.text) {
        console.log("Skipping telegram message: " + msg.text);
        return null;
    }
});
