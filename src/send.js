/*
    send.js

    Includes the core genericSend and genericEdit methods.
    (C) Adam Gincel - 2018
*/

async function genericSendMessage(text, platformObject, bots) {
    if (platformObject.platform == "telegram") {
        let ret = await bots.telegram.sendMessage(parseInt(platformObject.server), text, {parse_mode: "Markdown"});
        return ret;
    } else {
        let ret = await platformObject.msg.channel.send(text);
        return ret;
    }
}

async function genericEditMessage(text, platformObject, bots, msg) {
    if (platformObject.platform == "telegram") {
        return await bots.telegram.editMessageText(text, {chat_id: msg.chat.id, message_id: msg.message_id, parse_mode: "Markdown"});
    } else {
        return await msg.edit(text);
    }
}

module.exports.genericSendMessage = genericSendMessage;
module.exports.genericEditMessage = genericEditMessage;