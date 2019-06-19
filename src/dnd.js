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
    s += prefix + "dm - set the DM for the group. Enables enemies to be spawned for the group.\n";
    s += prefix + "dmhelp - Commands the DM can use to spawn enemies, give things to players, etc.\n";
    s += prefix + "combat - Commands to be used during combat by both players and the DM alike.\n";
    s += prefix + "character X - Set the active character.\n";
    s += prefix + "sheet or " + prefix + "info - Read stats and info about the active character.\n";
    s += prefix + "newcharacter Name - Creates a new character with the given name.\n";
    s += prefix + "setup - Commands to help set or change your character's stats, traits, spells, equipment, etc.\n";

    return s;
}

function getSetup(prefix) {
    let s = "DnD Character and Enemy Setup Help:\n\n";
    s += prefix + "name - set the Active Character's name.\n";
    s += prefix + "class - set the Active Character's class.\n";
    s += prefix + "level - set the Active Character's level.\n";
    s += prefix + "money - set the Active Character's money.\n";
    s += prefix + "hp - set the Active Character's maximum HP.\n";
    s += prefix + "currentHp - set the Active Character's current HP. Cannot go higher than max. Could also use /heal for this.\n";
    s += prefix + "ac - set the Active Character's Armor Class.\n";
    s += prefix + "str - set the Active Character's Strength stat.\n";
    s += prefix + "dex - set the Active Character's Dexterity stat.\n";
    s += prefix + "con - set the Active Character's Constitution stat.\n";
    s += prefix + "int - set the Active Character's Intelligence stat.\n";
    s += prefix + "wis - set the Active Character's Wisdom stat.\n";
    s += prefix + "cha - set the Active Character's Charisma stat.\n";
    s += prefix + "addTrait - adds a trait to the character's trait list.\n";
    s += prefix + "addSpell - adds a spell to the character's spell list.\n";
    s += prefix + "addEquipment - adds equipment to the character's equipment list.\n";
    s += prefix + "addItem - adds an item to the character's inventory list.\n";
    s += prefix + "removeTrait - removes the specified trait from the trait list.\n";
    s += prefix + "removeSpell - removes the specified spell from the spell list.\n";
    s += prefix + "removeEquipment - removes the specified equipment from the equipment list.\n";
    s += prefix + "removeItem - removes the specified item from the item list.\n";

    return s;
}

function getEnemySetup(prefix) {
    let s = "DnD Character and Enemy Setup Help:\n\n";
    s += prefix + "newEnemy Level HP AC STR DEX CON INT WIS CHA Name - Creates an enemy with all stats. Check https://waveparadigm.dev/dndenemy for a wizard that creates this command for you.\n";
    s += prefix + "myEnemies - Returns an indexed list of all of your created enemies.\n";
    s += prefix + "enemyname 0 Name - set the Active Character's name.\n";
    s += prefix + "enemylevel 0 5 - set the Active Character's level.\n";
    s += prefix + "enemyhp 0 25 - set the Active Character's maximum HP.\n";
    s += prefix + "enemycurrentHp 0 25 - set the Active Character's current HP. Cannot go higher than max. Could also use /heal for this.\n";
    s += prefix + "enemyac 0 15 - set the Active Character's Armor Class.\n";
    s += prefix + "enemystr 0 16 - set the Active Character's Strength stat.\n";
    s += prefix + "enemydex 0 16 - set the Active Character's Dexterity stat.\n";
    s += prefix + "enemycon 0 16 - set the Active Character's Constitution stat.\n";
    s += prefix + "enemyint 0 16 - set the Active Character's Intelligence stat.\n";
    s += prefix + "enemywis 0 16 - set the Active Character's Wisdom stat.\n";
    s += prefix + "enemycha 0 16 - set the Active Character's Charisma stat.\n";
    s += prefix + "enemyaddItem - adds an item to the character's inventory list.\n";
    s += prefix + "enemyRemoveItem - removes the specified item from the item list.\n";

    return s;
}

function getDmHelp(prefix) {
    let s = "DM Commands:\n\n";

    s += prefix + "spawn 0 - Would spawn Enemy 0 from your enemies list. Enemies can be targeted by players.";
    s += prefix + "pay @user X - Would add X money to the character used by the tagged user.";

    return s;
}

async function handle(text, platformObject, args, bots) {
    async function sendMessage (text) {
        return await send.genericSendMessage(text, platformObject, bots);
    }
    async function editMessage(text, msg) {
        return await send.genericEditMessage(text, platformObject, bots, msg);
    }
    let prefix = platformObject.platform == "telegram" ? "/" : "=";
    let group = dndIO.getGroup(platformObject.server);
    let user = dndIO.getUser(platformObject.userID, platformObject.name);
    let character = dndIO.getCharacter(user.id);

    //add player to group if not present
    if (group.players[user.id] == undefined) {
        group.players[user.id] = user.activeCharacter;
    }

    //HELP MESSAGES
    if (args[0] == "/dnd") {
        return await sendMessage(getHelp(prefix));
    } else if (args[0] == "/setup") {
        return await sendMessage(getSetup(prefix));
    } else if (args[0] == "/dmhelp") {
        return await sendMessage(getDmHelp(prefix));
    } 
    
    //DM COMMANDS
    else if (args[0] == "/dm") {
        if (platformObject.mentions.length > 0 && (!group.dm || platformObject.userID == group.dm)) {
            group.dm = platformObject.mentions[0].id;
            return await sendMessage("Successfully set " + platformObject.mentions[0].username + " as this group's DM. They can now use " + prefix + "dmhelp to view commands available to them.");
        }else {
            return await sendMessage("Usage: `" + prefix + " @user` - @ mention the user in this group you'd like to act as your DM.");
        }
    } 
    
    //PLAYER SETUP/INFO COMMANDS
    else if (args[0] == "/character") {
        if (args < 2) {
            return await sendMessage(`USAGE: \`${args[0]} X\` - Sets your active character to the Xth character in your character list. View your character list with \`${prefix}characters\`, or can view info on your currently selected character (${character.name}) with \`${prefix}sheet\``);
        }

        let v = parseInt(args[1]);
        if (isNaN(v)) {
            for (let i = 0; i < user.characters.length; i++) {
                if (user.characters[i].name.toLowerCase().startsWith(args[1])) {
                    v = i;
                    break;
                }
            }
            if (isNaN(v)) {
                return await sendMessage("Please specify the desired character's name or index. View your characters with `" + prefix + "characters`");
            }
        }

        user.activeCharacter = v;
        dndIO.writeUser(user.id, user);
        character = dndIO.getCharacter(user.id);
        return await sendMessage(`Successfully set active character to ${character.name}. Get full character info with ${prefix}sheet`);
    } else if (args[0] == "/sheet" || args[0] == "/info") {
        if (!character) {
            return await sendMessage("You have not created a character yet. Do so with " + prefix + "newcharacter");
        }

        let s = "Active Character:\nName: " + character.name + "\n";
        s += `Class: ${character.class}\n`;
        s += `Level: ${character.level}\n`;
        s += `Money: ${character.money}\n\n`;

        s += `HP: ${character.stats.currentHp} / ${character.stats.hp}\n`;
        s += `AC: ${character.stats.ac}\n`;
        s += `STR: ${character.stats.strength}\n`;
        s += `DEX: ${character.stats.dexterity}\n`;
        s += `CON: ${character.stats.constitution}\n`;
        s += `INT: ${character.stats.intelligence}\n`;
        s += `WIS: ${character.stats.wisdom}\n`;
        s += `CHA: ${character.stats.charisma}\n\n`;

        s += `Traits: ${prefix}traits\n`;
        s += `Spells: ${prefix}spells\n`;
        s += `Equipment: ${prefix}equipment\n`;
        s += `Inventory: ${prefix}inventory\n`;
        
        return await sendMessage(s);
    } else if (["/traits", "/spells", "/equipment", "/inventory"].indexOf(args[0]) >= 0) {
        let arr = character ? character[args[0].substring(1)] : null;
        if (!arr) {
            return await sendMessage("Error. Do you not have a character setup yet?");
        }

        let s = character.name + "'s " + args[0].charAt(1).toUpperCase() + args[0].substring(2) + ":\n";
        for (let i = 0; i < arr.length; i++) {
            s += "\n" + i.toString() + ": " + arr[i];
        }
        return await sendMessage(s);
    } else if (args[0] == "/newcharacter") {
        if (args.length <= 1) {
            return await sendMessage("USAGE: `/newcharacter Name`");
        }
        let characterName = text.substring("/newcharacter ".length, text.length);
        dndIO.createCharacter(user.id, characterName);
        character = dndIO.getCharacter(user.id);
        return await sendMessage(`Created new character ${character.name}. They are now your active character - use the \`/character\` command to switch characters.\n\nUse the \`/setup\` command for info on setting ${character.name}'s stats, traits, etc.`);
    } else if (["/name", "/class", "/level", "/money"].indexOf(args[0]) >= 0) {
        if (args.length < 2) {
            return await sendMessage("USAGE: `" + args[0] + " value` - Sets the specified character trait to the given value.");
        }
        let value = text.substring(args[0].length + 1, text.length);

        let result = dndIO.setCharacterTrait(user.id, args[0].substring(1), value);
        
        if (result) {
            return await sendMessage(`Set ${character.name}'s ${args[0].substring(1)} to \`${value}\``);
        } else {
            return await sendMessage(`There was an issue. Please contact the developer.`);
        }
    } else if (["/hp", "/currenthp", "/ac", "/str", "/strength", "/dex", "/dexterity", "/con", "/cons", "/constitution", "/int", "/intelligence", "/wis", "/wisdom", "/cha", "/charisma"].indexOf(args[0]) >= 0) {
        if (args.length < 2) {
            return await sendMessage("USAGE: `" + args[0] + " value` - Sets the specified stat to the given value.");
        }

        let v = parseInt(args[1]);
        if (isNaN(v)) {
            return await sendMessage("Please set that stat to a valid number.");
        }

        let result = dndIO.setCharacterStat(user.id, args[0].substring(1), v);
        if (result) {
            return await sendMessage(`Set ${character.name}'s ${args[0].substring(1)} to \`${v}\``);
        } else {
            return await sendMessage(`There was an issue. Please reach out to the developer.`);
        }
    } else if (["/addtrait", "/addequipment", "/addequip", "/addspell", "/addinventory", "/additem"].indexOf(args[0]) >= 0) {
        if (args.length < 2) {
            return await sendMessage("USAGE: `" + args[0] + " value` - Adds the value to the specified list.");
        }
        let value = text.substring(args[0].length + 1, text.length);

        let result = dndIO.addCharacterList(user.id, args[0], value);
        if (result) {
            return await sendMessage(`Added ${value} to ${character.name}'s ${args[0].substring(4)} list.`);
        } else {
            return await sendMessage(`There was an issue. Please reach out to the developer.`);
        }
    } else if (["/removetrait", "/removeequipment", "/removeequip", "/removespell", "/removeinventory", "/removeitem"].indexOf(args[0]) >= 0) {
        if (args.length < 2) {
            return await sendMessage("USAGE: `" + args[0] + " index` - Removes the item at the given index from the specified list.");
        }

        let v = parseInt(args[1]);
        if (isNaN(v)) {
            return await sendMessage("Please specify a numerical index to remove from the specified list. The numerical index is listed before each item in the list when the bot displays it.");
        }

        let result = dndIO.removeCharacterList(user.id, args[0], v);
        if (result) {
            return await sendMessage(`Successfully removed item from the specified list.`);
        } else {
            return await sendMessage(`Operation failed. Was the specified index not found in the list? Check the contents of the specified list and try again.`);
        }
    }

    //ENEMY SETUP/INFO COMMANDS
    else if (args[0] == "/enemy") {
        if (args.length < 2) {
            return await sendMessage("Usage: `" + args[0] + " 0` - Returns Enemy 0. See a list of all enemies with " + prefix + "myEnemies");
        }
        let v = parseInt(args[1]);
        if (isNaN(v)) {
            return await sendMessage("Usage: `" + args[0] + " 0` - Returns Enemy 0. See a list of all enemies with " + prefix + "myEnemies")
        }

        let enemy = dndIO.getEnemy(user.id, v);
        if (!enemy) {
            return await sendMessage("Unable to find enemy with index " + v + " - See a list of all your enemies with " + prefix + "`myEnemies`");
        }

        let s = `Enemy ${v}:\nName: ${enemy.name}\n`;
        s += `Level: ${enemy.level}\n`;
        s += `Total HP: ${enemy.stats.hp}\n`;
        s += `AC: ${enemy.stats.ac}\n`;
        s += `STR: ${enemy.stats.strength}\n`;
        s += `DEX: ${enemy.stats.dexterity}\n`;
        s += `CON: ${enemy.stats.constitution}\n`;
        s += `INT: ${enemy.stats.intelligence}\n`;
        s += `WIS: ${enemy.stats.wisdom}\n`;
        s += `CHA: ${enemy.stats.charisma}\n\nInventory:\n`;

        for (let i = 0; i < enemy.inventory.length; i++) {
            s += i.toString() + `: ${enemy.inventory[i]}\n`;
        }

        return await sendMessage(s);
    } else if (args[0] == "/myenemies") {
        let s = "Your Created Enemies:\n";
        for (let i = 0; i < user.enemies.length; i++) {
            s += i.toString() + ": " + user.enemies[i].name + "\n";
        }
        s += "------\n`" + prefix + "enemy 0` would get you info on Enemy 0, etc.";
        return await sendMessage(s);
    } else if (args[0] == "/newenemy") {
        let errorString = "USAGE: " + args[0] + " Level HP AC STR DEX CON INT WIS CHA Name - Creates an enemy with all stats. Check https://waveparadigm.dev/dndenemy for a wizard that creates this command for you.";
        if (args.length < 11) {
            return await sendMessage(errorString);
        }

        let name = text.substring(text.indexOf(text.split(" ")[10]), text.length); //from the first word after CHA to the end is the name

        let iArgs = []; //Level HP AC STR DEX CON INT WIS CHA
        for (let i = 1; i < 10; i++) {
            let v = parseInt(args[i]);
            if (isNaN(v)) {
                return await sendMessage(errorString);
            } else {
                iArgs.push(v);
            }
        }

        dndIO.createEnemy(user.id, name);
        user = dndIO.getUser(user.id, user.username); //update user, now has enemy
        let enemy = user.enemies[user.enemies.length - 1];
        enemy.level = iArgs[0];
        enemy.stats.hp = iArgs[1];
        enemy.stats.currentHp = enemy.stats.hp;
        enemy.stats.ac = iArgs[2];
        enemy.stats.strength = iArgs[3];
        enemy.stats.dexterity = iArgs[4];
        enemy.stats.constitution = iArgs[5];
        enemy.stats.intelligence = iArgs[6];
        enemy.stats.wisdom = iArgs[7];
        enemy.stats.charisma = iArgs[8];
        dndIO.writeEnemy(user.id, user.enemies.length - 1, enemy);

        return await sendMessage(`New Enemy #${user.enemies.length - 1} ${name} created.\nRead its info with: ${prefix}enemy ${user.enemies.length - 1}\nAdd to its inventory (can be used for traits, spells, loot, etc) with: ${prefix}enemyAddItem ${user.enemies.length - 1} Item To Add`);
    } else if (["/enemyname", "/enemylevel"].indexOf(args[0]) >= 0) {
        if (args.length < 3) {
            return await sendMessage("USAGE: " + args[0] + " 0 Value - would set the desired property of Enemy 0 to the given Value.");
        }

        let v = parseInt(args[1]);
        if (isNaN(v)) {
            return await sendMessage("USAGE: " + args[0] + " 0 Value - would set the desired property of Enemy 0 to the given Value.");
        }

        let value = text.substring(text.indexOf(text.split(" ")[2]), text.length);

        let enemy = dndIO.getEnemy(user.id, v);
        if (!enemy) {
            return await sendMessage("Unable to find Enemy #" + v + " - Check your enemies list with " + prefix + "myEnemies");
        }
        
        let result = dndIO.setEnemyTrait(user.id, v, args[0].substring("/enemy".length), value);
        if (result) {
            return await sendMessage(`Changed ${enemy.name}'s ${args[0].substring("/enemy".length)} to ${value}`);
        } else {
            return await sendMessage(`The operation was unsuccessful. Reach out to the developer.`);
        }
    } else if (["/enemyhp", "/enemycurrenthp", "/enemyac", "/enemystr", "/enemystrength", "/enemydex", "/enemydexterity", "/enemycon", "/enemyconstitution", "/enemyint", "/enemyintelligence", "/enemywis", "/enemywisdom", "/enemycha", "/enemycharisma"].indexOf(args[0]) >= 0) {
        if (args.length < 3) {
            return await sendMessage("USAGE: " + args[0] + " 0 Value - would set the desired property of Enemy 0 to the given Value.");
        }

        let v = parseInt(args[1]);
        let w = parseInt(args[2]);
        if (isNaN(v) || isNaN(w)) {
            return await sendMessage("USAGE: " + args[0] + " 0 15 - would set the desired stat of Enemy 0 to 15");
        }

        let enemy = dndIO.getEnemy(user.id, v);
        if (!enemy) {
            return await sendMessage("Unable to find Enemy #" + v + " - Check your enemies list with " + prefix + "myEnemies");
        }

        let result = dndIO.setEnemyStat(user.id, v, args[0].substring("/enemy".length), w);
        if (result) {
            return await sendMessage(`Successfully changed ${enemy.name}'s ${args[0].substring("/enemy".length).toUpperCase()} to ${w}`);
        } 
    } else if (args[0] == "/enemyadditem") {
        if (args.length < 3) {
            return await sendMessage("USAGE: " + args[0] + " 0 Value - would set the desired property of Enemy 0 to the given Value.");
        }

        let v = parseInt(args[1]);
        if (isNaN(v)) {
            return await sendMessage("USAGE: " + args[0] + " 0 Value - would set the desired property of Enemy 0 to the given Value.");
        }

        let value = text.substring(text.indexOf(text.split(" ")[2]), text.length);

        let enemy = dndIO.getEnemy(user.id, v);
        if (!enemy) {
            return await sendMessage("Unable to find Enemy #" + v + " - Check your enemies list with " + prefix + "myEnemies");
        }
        
        let result = dndIO.addEnemyList(user.id, v, "inventory", value);
        if (result) {
            return await sendMessage(`Successfully added ${value} to ${enemy.name}'s Inventory with Index ${enemy.inventory.length}.`);
        } else {
            return await sendMessage(`Operation failed. Reach out to the developer to investigate this issue.`);
        }
    } else if (args[0] == "/enemyremoveitem") {
        if (args.length < 3) {
            return await sendMessage("USAGE: " + args[0] + " 0 1 - would remove the inventory item with index 1 from Enemy 0's inventory.");
        }

        let v = parseInt(args[1]);
        let w = parseInt(args[2]);
        if (isNaN(v) || isNaN(w)) {
            return await sendMessage("USAGE: " + args[0] + " 0 1 - would remove the inventory item with index 1 from Enemy 0's inventory.");
        }

        let enemy = dndIO.getEnemy(user.id, v);
        if (!enemy) {
            return await sendMessage("Unable to find Enemy #" + v + " - Check your enemies list with " + prefix + "myEnemies");
        }

        if (enemy.inventory.length >= w) {
            return await sendMessage("Index " + w + " is out of bounds for this enemy. Check their inventory with " + prefix + "enemyInventory " + v);
        }
        
        let removed = enemy.inventory.splice(w, 1);
        dndIO.writeEnemy(user.id, v, enemy);
        return await sendMessage(`Successfully removed item from ${enemy.name}: ${removed}`);
    }

    //PLAY COMMANDS
    else if (args[0] == "/roll") {
        if (args.length <= 1 || args[1].indexOf("d") < 0) {
            return await sendMessage("Usage: `/roll XdY`, for example: `/roll 2d20`");
        }
        try {
            let quantity = parseInt(args[1].split("d")[0]);
            let diceSize = parseInt(args[1].split("d")[1]);
            let modifier = 0;
            if (args.length > 1) {
                modifier = parseInt(args[2]);
            if (isNaN(modifier))
                modifier = 0;
            }
            if (isNaN(quantity) || isNaN(diceSize))
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
    } 
}

module.exports.handle = handle;