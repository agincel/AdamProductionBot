/*
    basic.js 

    Some simple command replies.
    (C) Adam Gincel - 2018
*/  

const send = require("./send.js");
const fs = require("fs");
const dndIO = require("./dnd/dndIO.js");


function getHelp(prefix) {
    let s = "DnD Module Help:\n\n";
    s += prefix + "roll - Roll any number of dice with any number of sides. You can add a modifier as well.\n";
    s += prefix + "newcharacter Name - Creates a new character with the given name.\n";
    s += prefix + "setup - Commands to help set or change your character's stats, traits, spells, equipment, etc.\n";
}

function getSetup(prefix) {
    let s = "DnD Character and Enemy Setup Help:\n\n";
    //s += prefix += ""
}

async function handle(text, platformObject, args, bots) {
    async function sendMessage (text) {
        return await send.genericSendMessage(text, platformObject, bots);
    }
    async function editMessage(text, msg) {
        return await send.genericEditMessage(text, platformObject, bots, msg);
    }

    let user = dndIO.getUser(platformObject.userID, platformObject.name);

    //command replies
    if (args[0] == "/dnd") {
        let prefix = platformObject.platform == "telegram" ? "/" : "=";
        return await sendMessage(getHelp(prefix));
    } else if (args[0] == "/setup") {
        
    }else if (args[0] == "/roll") {
        if (args.length <= 1 || args[1].indexOf("d") < 0) {
            return await sendMessage("Usage: `/roll XdY`, for example: `/roll 2d20`");
        }
        try {
            let quantity = parseInt(args[1].split("d")[0]);
            let diceSize = parseInt(args[1].split("d")[1]);
            let modifier = 0;
            if (args.length > 1) {
                modifier = parseInt(args[2]);
            if (modifier.toString() == "NaN")
                modifier = 0;
            }
            if (!quantity || !diceSize)
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
            for (let i = 0; i < results.length && results.length < 120; i++) {
                ret += "Die " + alphabet[i % 26] + ": " + results[i].toString() + "\n";
            }
            ret += "-----\n";
            ret += "Total: " + total.toString();
            total += modifier;
            if (modifier > 0) {
                ret += "\n-----\n+" + modifier.toString() + " = " + total.toString();
            } else if (modifier < 0) {
                ret += "\n-----\n" + modifier.toString() + " = " + total.toString();
            }

	        ret += "\n```";
            return await sendMessage(ret);
        } catch (e) {
            console.log(e);
            return await sendMessage("There was an error. Unless you gave me some weird input, you should let Adam know.");
        }
    } else if (args[0] == "/newcharacter") {
        if (args.length <= 1) {
            return await sendMessage("USAGE: `/newcharacter Name`");
        }
        let characterName = text.substring("/newcharacter ".length, text.length);
        dndIO.createCharacter(user.id, characterName);
        let character = dndIO.getCharacter(user.id);
        return await sendMessage(`Created new character ${character.name}. They are now your active character - use the \`/character\` command to switch characters.\n\nUse the \`/setup\` command for info on setting ${character.name}'s stats, traits, etc.`);
    }
}