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

let acceptingMessages = false;
setTimeout(function() {
	acceptingMessages = true;
	console.log("Bot is now accepting messages.");
}, 3000);

//include from /src/
const basic = require("./src/basic.js");
const quote = require("./src/quote.js");


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
}


DiscordBot.on('message', async (msg) => {
    if (acceptingMessages) {
        console.log("Got a discord message: " + msg.content);
        let args = msg.content.toLowerCase().split(" ");
        
        if (args[0][0] == "=") 
            args[0] = args[0].replace("=", "/"); //if they said =test, make it /test -- done to not use / notation for discord bc that's bad
        else if (args[0][0] == "/")
            args[0] = args[0].split("/")[1]; //remove a prefix / if they typed it for something else, effectively disabling / notation on discord as intended

        let platformObject = {
            platform: "discord",
            msg: msg,
            name: msg.author.username,
            userID: msg.author.id,
            server: msg.guild.id
        }
        
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
            name: user.username,
            userID: user.id,
            server: messageReaction.message.guild.id
        };

        let messageToQuote = { //emulate the telegram message structure for simplicity later on
            text: messageReaction.message.content,
            from: {
                username: messageReaction.message.author.tag
            }
        };
        let bots = {telegram: TelegramBot, discord: DiscordBot};

        await quote.handle("", platformObject, ["/quoteadd"], messageToQuote, bots);
    }
	
});

TelegramBot.on('message', async (msg) => {
    if (acceptingMessages && msg.text) {
        const chatId = msg.chat.id;
        console.log("Got a telegram message: " + msg.text);
        let args = msg.text.toLowerCase().split(" ");
        if (args[0].indexOf("@") > -1) 
            args[0] = args[0].split("@")[0]; //change /command@BotUserName to /command, really should check for equality with username
        
        let platformObject = {
            platform: "telegram",
            msg: msg,
            name: msg.from.username ? msg.from.username : msg.from.first_name,
            userID: msg.from.id,
            server: msg.chat.id.toString()
        }

        return await handleMessage(msg.text, platformObject, args);
    } else if (msg.text) {
        console.log("Skipping telegram message: " + msg.text);
        return null;
    }
});