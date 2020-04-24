/*
    basic.js 

    Some simple command replies.
    (C) Adam Gincel - 2018
*/  

const send = require("./send.js");
const fs = require("fs");
const dndIO = require("./dnd/dndIO.js");

const skills = {
    "all": [
        "/acrobatics", "/animalhandling", "/animal", "/arcana", "/athletics", "/deception", "/history", "/insight", "/intimidation", "/investigation", "/medicine", "/nature",
        "/perception", "/performance", "/persuasion", "/religion", "/slightofhand", "/slight", "/stealth", "/survival", "/initiative"
    ],
    "strength": [
        "/athletics"
    ],
    "dexterity": [
        "/acrobatics", "/slightofhand", "/slight", "/stealth", "/initiative"
    ],
    "intelligence": [
        "/arcana", "/history", "/investigation", "/nature", "/religion"
    ],
    "wisdom": [
        "/animalhandling", "/animal", "/insight", "/medicine", "/perception", "/survival"
    ],
    "charisma": [
        "/deception", "/intimidation", "/performance", "/persuasion"
    ]
};

const personaSpells = [
    {name: "zio",       cost: 3,        dice: "2d6 +wisdom"},
    {name: "agi",       cost: 4,        dice: "2d8 +wisdom"},
    {name: "garu",      cost: 3,        dice: "3d4 +wisdom"},
    {name: "bufu",      cost: 4,        dice: "4d4 +wisdom"},
    {name: "frei",      cost: 5,        dice: "1d20 +wisdom"},
    {name: "psi",       cost: 5,        dice: "3d6 +wisdom"},
    {name: "kouha",     cost: 3,        dice: "1d10 +wisdom"},
    {name: "eiha",      cost: 6,        dice: "2d12 +wisdom"},
    {name: "lunge",     cost: 2,        dice: "1d10 +strength"},
    {name: "cleave",    cost: 3,        dice: "2d6 +strength"},
    {name: "dia",       cost: 4,        dice: "2d4 +wisdom"},
    {name: "tarukaja",  cost: 7},
    {name: "rakukaja",  cost: 6},
    {name: "tarunda",   cost: 7},
    {name: "rakunda",   cost: 7}
];
const personaSpellNames = [];
for (let ps of personaSpells) {
    personaSpellNames.push("/" + ps.name);
}

function getModifier(v) {
    return Math.floor(v / 2) - 5;
}

function getProficiency(l) {
    return 1 + Math.ceil(l / 4);
}

function getChosenStat(statName) {
    let stats = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    let chosenStat = null;
    for (let i = 0; i < stats.length; i++) {
        if (statName.length >= 2 && stats[i].toLowerCase().startsWith(statName.toLowerCase())) {
            chosenStat = stats[i];
            break;
        }
    }

    return chosenStat;
}

function skillFilter(skillName) {
    skillName = skillName.toLowerCase();
    let map = {
        "slightofhand": "slight",
        "slight of hand": "slight",
        "animalhandling": "animal",
        "animal handling": "animal"
    };
    if (map[skillName])
        return map[skillName];
    return skillName;
}

function getHelp(prefix) {
    let s = "DnD Module Help:\n\n";
    s += prefix + "roll - Roll any number of dice with any number of sides. You can add a modifier as well.\n";
    s += prefix + "dm - set the DM for the group. Enables enemies to be spawned for the group.\n";
    s += prefix + "dmhelp - Commands the DM can use to spawn enemies, give things to players, etc.\n";
    s += prefix + "combat - Commands to be used during combat by both players and the DM alike.\n";
    s += prefix + "character X - Set the active character.\n";
    s += prefix + "sheet or " + prefix + "info - Read stats and info about the active character.\n";
    s += prefix + "setup - Commands to help set or change your character's stats, traits, spells, equipment, etc.\n";
    s += prefix + "enemySetup - Commands to help create or modify your created enemies for use in campaigns.\n";
    s += prefix + "givemoney @user 150 - Would give @user's active character 150gp. From a DM this can be done with no limit, from players they can only give from what they have.\n";
    s += prefix + "pay 150 - Would cause the player typing it to lose 150gp. Used to pay shopkeepers, NPCs, etc.\n";

    return s;
}

function getSetup(prefix) {
    let s = "DnD Character and Enemy Setup Help:\n\n";
    s += prefix + "newcharacter Name - Creates a new character with the given name.\n";
    s += prefix + "name - set the Active Character's name.\n";
    s += prefix + "class - set the Active Character's class.\n";
    s += prefix + "level - set the Active Character's level.\n";
    s += prefix + "money - set the Active Character's money.\n";
    s += prefix + "hp - set the Active Character's maximum HP.\n";
    s += prefix + "currentHp - set the Active Character's current HP. Cannot go higher than max. Could also use /heal for this.\n";
    s += prefix + "sp - set the Active Character's current SP. Could also use /restoresp for this.\n";
    s += prefix + "maxSp - set the Active Character's Max SP.\n";
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
    s += prefix + "addProficiency - adds a skill to your character's proficiencies.\n";
    s += prefix + "addExpertise - adds a skill to your character's expertises.\n";
    s += prefix + "removeTrait - removes the specified trait from the trait list.\n";
    s += prefix + "removeSpell - removes the specified spell from the spell list.\n";
    s += prefix + "removeEquipment - removes the specified equipment from the equipment list.\n";
    s += prefix + "removeItem - removes the specified item from the item list.\n";
    s += prefix + "removeProficiency - removes the specified proficiency from the list.\n";
    s += prefix + "removeExpertise - removes the specified expertise from the list.\n";

    return s;
}

function getEnemySetup(prefix) {
    let s = "DnD Character and Enemy Setup Help:\n\n";
    s += prefix + "newEnemy Level HP AC STR DEX CON INT WIS CHA Name - Creates an enemy with all stats. Check https://waveparadigm.dev/dndenemy for a wizard that creates this command for you.\n";
    s += prefix + "deleteEnemy 0 - Deletes Enemy 0.\n";
    s += prefix + "myEnemies - Returns an indexed list of all of your created enemies.\n";
    s += prefix + "enemyname 0 Name - set enemy 0's name.\n";
    s += prefix + "enemylevel 0 5 - set enemy 0's level.\n";
    s += prefix + "enemyhp 0 25 - set enemy 0's maximum HP.\n";
    s += prefix + "enemyac 0 15 - set enemy 0's Armor Class.\n";
    s += prefix + "enemystr 0 16 - set enemy 0's Strength stat.\n";
    s += prefix + "enemydex 0 16 - set enemy 0's Dexterity stat.\n";
    s += prefix + "enemyint 0 16 - set enemy 0's Intelligence stat.\n";
    s += prefix + "enemywis 0 16 - set enemy 0's Wisdom stat.\n";
    s += prefix + "enemycha 0 16 - set enemy 0's Charisma stat.\n";
    s += prefix + "enemyaddItem 0 Item - adds an item to enemy 0's inventory list.\n";
    s += prefix + "enemyRemoveItem 0 0 - removes item 0 from enemy 0's inventory list.\n";

    return s;
}

function getDmHelp(prefix) {
    let s = "DM Commands:\n\n";

    s += prefix + "spawn 0 - Would spawn Enemy 0 from your enemies list. Enemies can be targeted by players.\n";
    s += prefix + "removeEnemy 0 - Would remove Enemy 0 from the enemies list. Usually done once the enemy is killed.\n";
    s += prefix + "pay @user X - Would add X money to the character used by the tagged user.\n";
    s += prefix + "enemies - View a list of all spawned enemies.\n";
    s += prefix + "save @user STR - Has @user make a Strength Saving Throw. Uses that user's active character's relevant modifier, and returns the result.\n";
    s += prefix + "hit @user 15 - Checks if a 15 hit's @user's active character's AC.\n";
    s += prefix + "damage @user 20 - Damages @user's active character by 20 HP.\n";
    s += prefix + "heal @user 10 - Heals @user's active character for 10 HP.\n";

    return s;
}

function getCombatHelp(prefix) {
    let s = "Player Combat Commands:\n\n";
    s += prefix + "enemies - View a list of all spawned enemies.\n";
    s += prefix + "save 0 STR - Has Enemy 0 make a Strength Saving Throw. Uses that enemy's relevant modifier, and returns the result.\n";
    s += prefix + "hit 0 15 - checks if a 15 hits Enemy 0's AC.\n";
    s += prefix + "damage 0 20 - Damages Enemy 0 by 20 HP.\n";
    s += prefix + "heal 0 10 - Heals enemy 0 for 10 HP.\n";

    return s;
}

async function handle(text, platformObject, args, bots) {
    async function sendMessage (text) {
        return await send.genericSendMessage(text, platformObject, bots);
    }
    async function editMessage(text, msg) {
        return await send.genericEditMessage(text, platformObject, bots, msg);
    }

    async function handleRoll(rollArgs) {
        if (/(\/[0-9]+d[0-9]+)/g.test(rollArgs[0]) || /(\/d[0-9]+)/g.test(rollArgs[0])) { //transform /1d20 shorthand into /roll 1d20
            let tArgs = [];
            for (let i = 0; i < args.length; i++) {
                tArgs[i] = rollArgs[i];
            }

            rollArgs[0] = "/roll";
            rollArgs[1] = tArgs[0].substring(1);
            for (let i = 1; i < tArgs.length; i++) {
                rollArgs[i + 1] = tArgs[i];
            }
        }

        if (rollArgs.length <= 1 || rollArgs[1].indexOf("d") < 0) {
            return "Usage: `/roll XdY`, for example: `/roll 2d20`";//return await sendMessage("Usage: `/roll XdY`, for example: `/roll 2d20`");
        }

        //replace statnames with appropriate character modifiers
        for (let i = 0; i < rollArgs.length; i++) {
            let s = getChosenStat(rollArgs[i]);
            if (!s) {
                s = getChosenStat(rollArgs[i].substring(1));
            }

            if (s) {
                if (character) {
                    let m = getModifier(character.stats[s]);
                    if (m) {
                        rollArgs[i] = "+" + m.toString();
                    } else {
                        return "Unable to find chosen stat " + rollArgs[i]; //return await sendMessage("Unable to find chosen stat " + rollArgs[i]);
                    }
                } else {
                    return "No active character in this group chat. Have you defined one with: " + prefix + "character X?";  //return await sendMessage("No active character in this group chat. Have you defined one with: " + prefix + "character X?");
                }
            }
        }

        //replace /roll 1d20 + 2 + 6 -> /roll 1d20 +2 +6
        let t = "";
        for (let i = 0; i < rollArgs.length; i++) {
            t += rollArgs[i] + " ";
        }

        while (t.indexOf("+ +") >= 0) {
            t = t.replace("+ +", "+");
        }

        while (t.indexOf("- -") >= 0) {
            t = t.replace("- -", "-");
        }

        while (t.indexOf("+ ") >= 0) {
            t = t.replace("+ ", "+");
        }
        while (t.indexOf("- ") >= 0) {
            t = t.replace("- ", "-");
        }

        rollArgs = t.split(" ");

        try {
            let quantity = parseInt(rollArgs[1].split("d")[0]);
            let diceSize = parseInt(rollArgs[1].split("d")[1]);
            let modifier = 0;
            
            for (let i = 2; i < rollArgs.length; i++) {
                let m = parseInt(rollArgs[i]);
                if (!isNaN(m)) {
                    modifier += m;
                }
            }

            if (isNaN(modifier)) {
                modifier = 0;
            }
            if (isNaN(quantity)) {
                quantity = 1;
            }

            if (diceSize < 0 || quantity < 0 || diceSize > 9999 || quantity > 9999) {
                return "Please roll a positive number of positively sized dice that isn't too big. Thank you.";  //return await sendMessage("Please roll a positive number of positively sized dice that isn't too big. Thank you.");
            }

            if (isNaN(diceSize))
                return rollArgs[1] + " contains an invalid dice quantity or size."; //return await sendMessage(rollArgs[1] + " contains an invalid dice quantity or size.");



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
            return ret; //return await sendMessage(ret);
        } catch (e) {
            console.log(e);
            return "There was an error. Unless you gave me some weird input, you should let Adam know."; //await sendMessage("There was an error. Unless you gave me some weird input, you should let Adam know.");
        }
    }


    let prefix = platformObject.platform == "telegram" ? "/" : "=";
    let group = dndIO.getGroup(platformObject.server);
    let user = dndIO.getUser(platformObject.userID, platformObject.name);

    //add player to group if not present
    if (group.players[user.id] == undefined) {
        group.players[user.id] = user.activeCharacter;
        dndIO.writeGroup(platformObject.server, group);
    } else {
        user.activeCharacter = group.players[user.id];
        dndIO.writeUser(user.id, user);
    }

    let character = dndIO.getCharacter(user.id);

    //HELP MESSAGES
    if (args[0] == "/dnd") {
        return await sendMessage(getHelp(prefix));
    } else if (args[0] == "/setup") {
        return await sendMessage(getSetup(prefix));
    } else if (args[0] == "/dmhelp") {
        return await sendMessage(getDmHelp(prefix));
    } else if (args[0] == "/enemysetup") {
        return await sendMessage(getEnemySetup(prefix));
    } else if (args[0] == "/combat") {
        return await sendMessage(getCombatHelp(prefix));
    }
    
    //DM COMMANDS
    else if (args[0] == "/dm") {
        if (platformObject.mentions.length > 0 && (!group.dm || platformObject.userID == group.dm)) {
            group.dm = platformObject.mentions[0].id;
            return await sendMessage("Successfully set " + platformObject.mentions[0].username + " as this group's DM. They can now use " + prefix + "dmhelp to view commands available to them.");
        } else if (!group.dm && args.length == 1) {
            group.dm = user.id;
            return await sendMessage("Successfully set " + user.username + " as this group's DM. They can now use " + prefix + "dmhelp to view commands available to them.");
        } else {
            return await sendMessage("Usage: `" + prefix + " @user` - @ mention the user in this group you'd like to act as your DM.");
        }
    } else if (args[0] == "/spawn") {
        if (group.dm == user.id) {
            //you are the DM
            if (args.length < 2) {
                return await sendMessage("USAGE: " + args[0] + " 0 - Spawns Enemy 0 from your Enemies List into this group.");
            }

            let v = parseInt(args[1]);
            if (isNaN(v)) {
                return await sendMessage(args[1] + " is not a valid integer.");
            }

            let enemyToSpawn = user.enemies[v];
            if (!enemyToSpawn) {
                return await sendMessage("Unable to find Enemy #" + v + " in your enemies list. Check your enemies list with " + prefix + "myEnemies");
            }

            group.enemies.push(JSON.parse(JSON.stringify(enemyToSpawn)));
            dndIO.writeGroup(platformObject.server, group);

            return await sendMessage(enemyToSpawn.name + " appeared!\n\nView all enemies with " + prefix + "enemies");
        } else {
            return await sendMessage("Only the DM can spawn enemies with the " + args[0] + " command.");
        }
    } else if (args[0] == "/removeenemy") {
        if (group.dm == user.id) {
            //you are the DM
            if (args.length < 2) {
                return await sendMessage("USAGE: " + args[0] + " 0 - Removes Enemy 0 from this group's Enemy List.");
            }

            let v = parseInt(args[1]);
            if (isNaN(v)) {
                return await sendMessage(args[1] + " is not a valid integer.");
            }

            if (v >= group.enemies.length || !group.enemies[v]) {
                return await sendMessage(v.toString() + " it not a valid enemy index. Check all currently spawned enemies with " + prefix + "enemies");
            }

            let enemyName = group.enemies[v].name;

            group.enemies.splice(v, 1);
            dndIO.writeGroup(platformObject.server, group);

            return await sendMessage(enemyName + " has been removed.");
        } else {
            return await sendMessage("Only the DM can remove enemies with the " + args[0] + " command.");
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

        if (user.characters.length == 0) {
            return await sendMessage("You have not yet created a character. Create one with " + prefix + "newCharacter");
        }

        user.activeCharacter = v;
        dndIO.writeUser(user.id, user);

        group.players[user.id] = v;
        dndIO.writeGroup(platformObject.server, group);

        character = dndIO.getCharacter(user.id);
        return await sendMessage(`Successfully set active character to ${character.name}. Get full character info with ${prefix}sheet`);
    } else if (args[0] == "/characters") {
        let s = "My Created Characters:\n\n";
        for (let i = 0; i < user.characters.length; i++) {
            s += i.toString() + ": " + user.characters[i].name + "\n";
        }

        if (user.characters.length == 0) {
            s += "None! Create your first character with " + prefix + "newCharacter";
        }

        return await sendMessage(s);
    } else if (args[0] == "/sheet" || args[0] == "/info") {
        if (!character) {
            return await sendMessage("If you have not created a character yet, you can do so with " + prefix + "newcharacter\n\nIf you have, you have not yet set it as your Active Character in this group. Do so with " + prefix + "character X");
        }

        let s = "Active Character:\nName: " + character.name + "\n";
        s += `Class: ${character.class}\n`;
        s += `Level: ${character.level}\n`;
        s += `Money: ${character.money}\n\n`;

        s += `HP: ${character.stats.currentHp} / ${character.stats.hp}\n`;
        s += `SP: ${character.stats.sp} / ${character.stats.maxSp}\n`;
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
        s += `Proficiencies: ${prefix}proficiencies\n`;
        s += `Expertises: ${prefix}expertises\n`;
        
        return await sendMessage(s);
    } else if (["/traits", "/spells", "/equipment", "/inventory", "/proficiencies", "/expertises"].indexOf(args[0]) >= 0) {
        let arr = character ? character[args[0].substring(1)] : null;
        if (!arr) {
            return await sendMessage("If you have not created a character yet, you can do so with " + prefix + "newcharacter\n\nIf you have, you have not yet set it as your Active Character in this group. Do so with " + prefix + "character X");
        }

        let s = character.name + "'s " + args[0].charAt(1).toUpperCase() + args[0].substring(2) + ":\n";
        for (let i = 0; i < arr.length; i++) {
            s += "\n" + i.toString() + ": " + arr[i];
        }
        return await sendMessage(s);
    } else if (args[0] == "/newcharacter") {
        let errorString = "USAGE: `" + args[0] + " Level HP AC STR DEX CON INT WIS CHA Name` - Creates a Character with all stats. Check https://waveparadigm.dev/dndcharacter for a wizard that creates this command for you.";
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

        dndIO.createCharacter(user.id, name);
        user = dndIO.getUser(user.id, user.username); //update user, now has character
        let character = dndIO.getCharacter(user.id);
        character.level = iArgs[0];
        character.stats.hp = iArgs[1];
        character.stats.currentHp = character.stats.hp;
        character.stats.ac = iArgs[2];
        character.stats.strength = iArgs[3];
        character.stats.dexterity = iArgs[4];
        character.stats.constitution = iArgs[5];
        character.stats.intelligence = iArgs[6];
        character.stats.wisdom = iArgs[7];
        character.stats.charisma = iArgs[8];

        dndIO.writeCharacter(user.id, character);

        group.players[user.id] = user.activeCharacter;
        dndIO.writeGroup(group.id, group);
        

        return await sendMessage(`New Character #${user.activeCharacter}: ${name} created.\nRead their info with: ${prefix}sheet after switching to it with ${prefix}character ${user.activeCharacter}\nView ${prefix}setup to use more commands to flesh out this character.`);
    } else if (args[0] == "/deletecharacter") {
        if (args.length < 2) {
            return await sendMessage("USAGE: " + args[0] + " 0 - Deletes Character 0. Be careful, this is irreversible.");
        }

        let v = parseInt(args[1]);
        if (isNaN(v)) {
            return await sendMessage(args[1] + " is not a valid index. View your characters with " + prefix + "characters");
        }
        let name = user.characters[v].name;
        user.characters.splice(v, 1);
        dndIO.writeUser(user.id, user);

        return await sendMessage("Deleted " + name + ".");
    } else if (["/name", "/class", "/level", "/money"].indexOf(args[0]) >= 0) {
        if (args.length < 2) {
            if (character && character[args[0].substring(1)]) {
                return await sendMessage(character.name + "'s " + args[0].substring(1) + ": " + character[args[0].substring(1)] + "\n\nUse `" + args[0] + " value` to overwrite the trait with a new `value`.");
            }
            return await sendMessage("USAGE: `" + args[0] + " value` - Sets the specified character trait to the given value.");
        }

        if (!character) {
            return await sendMessage("If you have not created a character yet, you can do so with " + prefix + "newcharacter\n\nIf you have, you have not yet set it as your Active Character in this group. Do so with " + prefix + "character X");
        }

        let value = text.substring(args[0].length + 1, text.length);

        let result = dndIO.setCharacterTrait(user.id, args[0].substring(1), value);
        
        if (result) {
            return await sendMessage(`Set ${character.name}'s ${args[0].substring(1)} to \`${value}\``);
        } else {
            return await sendMessage(`There was an issue. Please contact the developer.`);
        }
    } else if (["/hp", "/currenthp", "/ac", "/str", "/strength", "/dex", "/dexterity", "/con", "/cons", "/constitution", "/int", "/intelligence", "/wis", "/wisdom", "/cha", "/charisma", "/sp", "/maxsp"].indexOf(args[0]) >= 0) {
        if (args.length < 2) {
            let stat = dndIO.getCharacterStat(user.id, args[0].substring(1));
            if (stat !== false) {
                return await sendMessage(character.name + "'s " + args[0].substring(1) + ": " + stat + "\n\nUse `" + args[0] + " value` to set that stat to a new `value`.");
            }
            return await sendMessage("USAGE: `" + args[0] + " value` - Sets the specified stat to the given value.");
        }

        if (!character) {
            return await sendMessage("If you have not created a character yet, you can do so with " + prefix + "newcharacter\n\nIf you have, you have not yet set it as your Active Character in this group. Do so with " + prefix + "character X");
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
    } else if (["/addtrait", "/addequipment", "/addequip", "/addspell", "/addinventory", "/additem", "/addproficiency", "/addexpertise"].indexOf(args[0]) >= 0) {
        if (args.length < 2) {
            return await sendMessage("USAGE: `" + args[0] + " value` - Adds the value to the specified list.");
        }

        if (!character) {
            return await sendMessage("If you have not created a character yet, you can do so with " + prefix + "newcharacter\n\nIf you have, you have not yet set it as your Active Character in this group. Do so with " + prefix + "character X");
        }

        let value = text.substring(args[0].length + 1, text.length);

        let result = dndIO.addCharacterList(user.id, args[0], value);
        if (result) {
            return await sendMessage(`Added ${value} to ${character.name}'s ${args[0].substring(4)} list.`);
        } else {
            return await sendMessage(`There was an issue. Please reach out to the developer.`);
        }
    } else if (["/removetrait", "/removeequipment", "/removeequip", "/removespell", "/removeinventory", "/removeitem", "/removeproficiency", "/removeexpertise"].indexOf(args[0]) >= 0) {
        if (args.length < 2) {
            return await sendMessage("USAGE: `" + args[0] + " index` - Removes the item at the given index from the specified list.");
        }

        if (!character) {
            return await sendMessage("If you have not created a character yet, you can do so with " + prefix + "newcharacter\n\nIf you have, you have not yet set it as your Active Character in this group. Do so with " + prefix + "character X");
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
        if (user.enemies.length == 0) {
            return await sendMessage("You have not created any enemies. You can do so with " + prefix + "newEnemy");
        }

        if (args.length < 2) {
            return await sendMessage("Usage: `" + args[0] + " 0` - Returns Enemy 0. See a list of all enemies with " + prefix + "myEnemies");
        }

        let v = parseInt(args[1]);
        if (isNaN(v)) {
            return await sendMessage("Usage: `" + args[0] + " 0` - Returns Enemy 0. See a list of all enemies with " + prefix + "myEnemies")
        }   

        let enemy = dndIO.getEnemy(user.id, v);
        if (!enemy) {
            return await sendMessage("Unable to find enemy with index " + v + " - See a list of all your enemies with " + prefix + "myEnemies");
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

        let enemy = dndIO.getEnemy(user.id, 0);
        if (enemy) {
            s += "------\n`" + prefix + "enemy 0` would get you info on " + enemy.name + ", etc.";
        } else {
            s += "None! Create a new enemy with " + prefix + "newEnemy";
        }
        
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
            return await sendMessage("USAGE: " + args[0] + " 0 15 - would set the desired property of Enemy 0 to 15.");
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
        if (args[0].substring("/enemy".length) == "hp") {
            dndIO.setEnemyStat(user.id, v, "currenthp", w);
        }
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
            return await sendMessage(`Successfully added ${value} to ${enemy.name}'s Inventory with Index ${enemy.inventory.length - 1}.`);
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

        if (w >= enemy.inventory.length) {
            return await sendMessage("Index " + w + " is out of bounds for this enemy. Check their inventory with " + prefix + "enemyInventory " + v);
        }
        
        let removed = enemy.inventory.splice(w, 1);
        dndIO.writeEnemy(user.id, v, enemy);
        return await sendMessage(`Successfully removed item from ${enemy.name}: ${removed}`);
    } else if (args[0] == "/deleteenemy") {
        if (args.length < 2) {
            return await sendMessage("USAGE: " + args[0] + " 0 - Deletes the Enemy at index 0. Check your enemies list with " + prefix + "myEnemies");
        }

        let v = parseInt(args[1]);
        if (isNaN(v)) {
            return await sendMessage("Invalid number.");
        }

        let enemy = dndIO.getEnemy(user.id, v);
        if (!enemy) {
            return await sendMessage("Unable to find Enemy #" + v + " - Check your enemies list with " + prefix + "myEnemies");
        }
        let enemyName = enemy.name;
        
        user.enemies.splice(v, 1);
        dndIO.writeUser(user.id, user);

        return await sendMessage(`Successfully deleted ${enemyName}. Bye!`);
    }

    //PLAY COMMANDS
    else if (args[0] == "/roll" || ((/(\/[0-9]+d[0-9]+)/g.test(args[0]) || /(\/d[0-9]+)/g.test(args[0])) && args[0].startsWith("/"))) {
        return await sendMessage(await handleRoll(args));
    } else if (args[0] == "/adv" || args[0] == "/advantage") {  
        //replace statnames with appropriate character modifiers
        for (let i = 0; i < args.length; i++) {
            let s = getChosenStat(args[i]);
            if (!s) {
                s = getChosenStat(args[i].substring(1));
            }

            if (s) {
                if (character) {
                    let m = getModifier(character.stats[s]);
                    if (m) {
                        args[i] = "+" + m.toString();
                    } else {
                        return await sendMessage("Unable to find chosen stat " + args[i]);
                    }
                } else {
                    return await sendMessage("No active character in this group chat. Have you defined one with: " + prefix + "character X?");
                }
            }
        }

        //fix the whole `+ ` thing.
        let t = args[0];
        for (let i = 1; i < args.length; i++) {
            t += " " + args[i];
        }

        while (t.indexOf("+ +") >= 0) {
            t = t.replace("+ +", "+");
        }

        while (t.indexOf("- -") >= 0) {
            t = t.replace("- -", "-");
        }

        while (t.indexOf("+ ") >= 0) {
            t = t.replace("+ ", "+");
        }
        while (t.indexOf("- ") >= 0) {
            t = t.replace("- ", "-");
        }

        args = t.split(" ");

        let modifier = 0;
        for (let i = 1; i < args.length; i++) {
            let m = parseInt(args[i]);
            if (!isNaN(m)) {
                modifier += m;
            }
        }

        let r1 = 20 - Math.floor(Math.random() * 20);

        if (r1 < 7 && r1 > 1) {
            r1 = Math.floor(Math.random() * 20) + 1;
        }

        let r2 = 20 - Math.floor(Math.random() * 20);

        if (r2 < 7 && r2 > 1) {
            r2 = Math.floor(Math.random() * 20) + 1;
        }

        let s = "Rolling 1d20 With Advantage:\n\n";
        s += "1st Roll: " + r1.toString() + (modifier != 0 ? " + " + modifier.toString() + " = " + (r1 + modifier).toString() : "") + "\n";
        s += "2nd Roll: " + r2.toString() + (modifier != 0 ? " + " + modifier.toString() + " = " + (r2 + modifier).toString() : "");

        return await sendMessage(s);
    } else if (args[0] == "/save") {
        let chosenStat = getChosenStat(args[args.length - 1]);
        if (args.length == 1 || (args.length == 2 && !chosenStat)) {
            return await sendMessage("USAGE by Players: " + args[0] + "STR - Make a STR save with your own character.\nUSAGE by Players on Enemies: " + args[0] + " 0 STR - Would make Enemy 0 perform a STR save, and return the result.\n\nUSAGE by DM on Players: " + args[0] + " @user STR - Would make @user perform a STR save, and return the result.");
        }

        let modifier = 0;
        let proficiencyBonus = 0;
        let name = "";
        
        if (!chosenStat) {
            return await sendMessage(args[args.length - 1] + " is not a valid stat name. Examples: STR, WIS, DEX");
        }

        //targeting user
        if (platformObject.mentions.length > 0) {
            let targetedUser = dndIO.getUser(platformObject.mentions[0].id, null);
            if (!targetedUser) {
                return await sendMessage("I do not have any stored information about " + platformObject.mentions[0].username);
            }

            if (group.players[targetedUser.id] == undefined) {
                return await sendMessage(targetedUser.username + " has not yet posted in this chat, and/or has not set their Active Player Character in this chat by using the " + prefix + "character command.");
            }

            if (targetedUser.id == group.dm) {
                return await sendMessage("You cannot target the DM directly.");
            }

            let targetedCharacter = dndIO.getCharacterAt(targetedUser.id, group.players[targetedUser.id]);
            if (!targetedCharacter) {
                return await sendMessage("Unable to find " + targetedUser.username + "'s Character at Index " + group.players[targetedUser.id] + ". This shouldn't really happen so reach out to the Developer with this if you could.");
            }

            modifier = getModifier(targetedCharacter.stats[chosenStat]);

            for (let i = 0; i < targetedCharacter.proficiencies.length; i++) {
                if (targetedCharacter.proficiencies[i].toLowerCase() == chosenStat) {
                    proficiencyBonus = getProficiency(parseInt(targetedCharacter.level));
                }
            }

            name = targetedCharacter.name;
        } else {
            if (args.length == 2) { //rolling save for active character
                if (character) {
                    modifier = getModifier(character.stats[chosenStat]);
                    for (let i = 0; i < character.proficiencies.length; i++) {
                        if (character.proficiencies[i].toLowerCase() == chosenStat) {
                            proficiencyBonus = getProficiency(parseInt(character.level));
                        }
                    }
                    name = character.name;
                } else {
                    return await sendMessage("Unable to make save. Have you created a character?");
                }
            } else { //targeting enemy with /save 0 STR syntax
                let v = parseInt(args[1]); //enemy index
                if (isNaN(v)) {
                    return await sendMessage("Invalid Enemy Index specified. To target the first enemy, use " + args[0] + " 0 " + args[args.length - 1]);
                }
                
                if (v >= group.enemies.length) {
                    return await sendMessage("Invalid Enemy Index specified. View currently active enemies with " + prefix + "enemies");
                }

                let targetedEnemy = group.enemies[v];
                if (!targetedEnemy) {
                    return await sendMessage("Unable to find the Enemy at Index " + v);
                }
                    
                modifier = getModifier(targetedEnemy.stats[chosenStat]);
                name = targetedEnemy.name;
            }

        }
        let roll = Math.floor(Math.random() * 20) + 1;
        let s = name + " rolling a " + chosenStat + " save:\n";
        s += "Rolled a " + roll;
        s += "\nModifier: " + modifier;
        
        if (proficiencyBonus > 0) {
            s += "\nProficient! +" + proficiencyBonus;
        }

        s += "\n\nFinal save: " + (roll + modifier + proficiencyBonus).toString();
        return await sendMessage(s);
    } else if (skills.all.indexOf(args[0]) >= 0) {
        let skillName = "";

        let keys = Object.keys(skills);
        for (let i = 0; i < keys.length; i++) {
            let k = keys[i];
            if (k != "all") {
                if (skills[k].indexOf(args[0]) >= 0) {
                    skillName = k;
                    break;
                }
            }
        }

        if (!skillName) {
            return await sendMessage("Unable to find skill named " + args[0]);
        }

        if (!character) {
            return await sendMessage("If you have not created a character yet, you can do so with " + prefix + "newcharacter\n\nIf you have, you have not yet set it as your Active Character in this group. Do so with " + prefix + "character X");
        }

        sName = skillFilter(args[0].substring(1));
        let proficient = false;
        let expert = false;
        for (let i = 0; character.proficiencies != undefined && i < character.proficiencies.length; i++) {
            let p = skillFilter(character.proficiencies[i]);
            if (sName == p) {
                proficient = true;
                break;
            }
        }

        for (let i = 0; character.expertises != undefined && i < character.expertises.length; i++) {
            let e = skillFilter(character.expertises[i]);
            if (sName == e) {
                expert = true;
                proficient = true;
                break;
            }
        }

        let modifier = getModifier(character.stats[skillName]);
        let proficiencyBonus = 0;
        let expertiseBonus = 0;

        if (proficient)
            proficiencyBonus = getProficiency(parseInt(character.level));
        if (expert)
            expertiseBonus = getProficiency(parseInt(character.level));


        let roll = 20 - Math.floor(Math.random() * 20);

        if (roll < 7 && roll > 1) {
            roll = Math.floor(Math.random() * 20) + 1;
        }

        let s = character.name + " rolling " + args[0].substring(1) + ":\n\n";
        s += "Rolled a " + roll;
        s += "\nModifier: " + modifier;
        s += (proficient ? "\nProficient! +" + proficiencyBonus : "");
        s += (expert ? "\nExpertise! +" + expertiseBonus : "");
        s += "\n\nTotal: " + (roll + modifier + proficiencyBonus + expertiseBonus).toString();
        return await sendMessage(s);
    } else if (args[0] == "/hit") {
        if (args < 3) {
            return await sendMessage("USAGE by Players on Enemies: " + args[0] + " 0 15 - Would check if a `15` would hit Enemy 0's AC.\n\nUSAGE by DM on Players: " + args[0] + " @user 15 - Would check if a `15` would hit @user's Active Character's AC.");
        }

        let name = "";
        let ac = 0;

        let hit = parseInt(args[args.length - 1]);
        if (isNaN(hit)) {
            return await sendMessage(args[args.length - 1] + " is not a hit roll. Please use a valid integer.");
        }

        //targeting user
        if (platformObject.mentions.length > 0) {
            let targetedUser = dndIO.getUser(platformObject.mentions[0].id, null);
            if (!targetedUser) {
                return await sendMessage("I do not have any stored information about " + platformObject.mentions[0].username);
            }

            if (group.players[targetedUser.id] == undefined) {
                return await sendMessage(targetedUser.username + " has not yet posted in this chat, and/or has not set their Active Player Character in this chat by using the " + prefix + "character command.");
            }

            if (targetedUser.id == group.dm) {
                return await sendMessage("You cannot target the DM directly.");
            }

            let targetedCharacter = dndIO.getCharacterAt(targetedUser.id, group.players[targetedUser.id]);
            if (!targetedCharacter) {
                return await sendMessage("Unable to find " + targetedUser.username + "'s Character at Index " + group.players[targetedUser.id] + ". Have they created a character with /newCharacter yet?");
            }

            ac = targetedCharacter.stats.ac;
            name = targetedCharacter.name;
        } else {
            let v = parseInt(args[1]); //enemy index
            if (isNaN(v)) {
                return await sendMessage("Invalid Enemy Index specified. To target the first enemy, use " + args[0] + " 0 " + args[args.length - 1]);
            }
            
            if (v >= group.enemies.length) {
                return await sendMessage("Invalid Enemy Index specified. View currently active enemies with " + prefix + "enemies");
            }

            let targetedEnemy = group.enemies[v];
            if (!targetedEnemy) {
                return await sendMessage("Unable to find the Enemy at Index " + v);
            }

            ac = targetedEnemy.stats.ac;
            name = targetedEnemy.name;
        }
        
        if (hit >= ac) {
            return await sendMessage("A " + hit + " will successfully hit " + name + "'s AC. 👍");
        }

        return await sendMessage("A " + hit + " will not hit " + name + "'s AC. 👎");
    } else if (args[0] == "/damage") {
        if (args < 3) {
            return await sendMessage("USAGE by Players on Enemies: " + args[0] + " 0 15 - Would check if a `15` would hit Enemy 0's AC.\n\nUSAGE by DM on Players: " + args[0] + " @user 15 - Would check if a `15` would hit @user's Active Character's AC.");
        }

        let damage = parseInt(args[args.length - 1]);
        if (isNaN(damage)) {
            return await sendMessage(args[args.length - 1] + " is not a damage quantity. Please use a valid integer.");
        }

        function getFlavorIndex(percent) {
            let r = 0;
            if (percent > 0.65)
                r = 0;
            else if (percent > 0.5)
                r = 1;
            else if (percent > 0.35)
                r = 2;
            else if (percent > 0.15)
                r = 3;
            else if (percent > 0)
                r = 4;
            else   
                r = 5;

            return r;
        }

        let flavor = [
            "They look to be in good health.",
            "They look a little rough around the edges.",
            "They look worse for wear.",
            "They look unwell.",
            "They look quite bloodied.",
            "Their hit points have dropped to 0."
        ];

        //targeting user
        if (platformObject.mentions.length > 0) {
            let targetedUser = dndIO.getUser(platformObject.mentions[0].id, null);
            if (!targetedUser) {
                return await sendMessage("I do not have any stored information about " + platformObject.mentions[0].username);
            }

            if (group.players[targetedUser.id] == undefined) {
                return await sendMessage(targetedUser.username + " has not yet posted in this chat, and/or has not set their Active Player Character in this chat by using the " + prefix + "character command.");
            }

            if (targetedUser.id == group.dm) {
                return await sendMessage("You cannot target the DM directly.");
            }

            let targetedCharacter = dndIO.getCharacterAt(targetedUser.id, group.players[targetedUser.id]);
            if (!targetedCharacter) {
                return await sendMessage("Unable to find " + targetedUser.username + "'s Character at Index " + group.players[targetedUser.id] + ". This shouldn't really happen so reach out to the Developer with this if you could.");
            }

            targetedCharacter.stats.currentHp = Math.max(targetedCharacter.stats.currentHp - damage, 0);
            dndIO.writeCharacterAt(targetedUser.id, group.players[targetedUser.id], targetedCharacter);

            return await sendMessage(targetedCharacter.name + " took " + damage + " points of damage. " + flavor[getFlavorIndex(targetedCharacter.stats.currentHp / targetedCharacter.stats.hp)]);
        } else {
            let v = parseInt(args[1]); //enemy index
            if (isNaN(v)) {
                return await sendMessage("Invalid Enemy Index specified. To target the first enemy, use " + args[0] + " 0 " + args[args.length - 1]);
            }
            
            if (v >= group.enemies.length) {
                return await sendMessage("Invalid Enemy Index specified. View currently active enemies with " + prefix + "enemies");
            }

            let targetedEnemy = group.enemies[v];
            if (!targetedEnemy) {
                return await sendMessage("Unable to find the Enemy at Index " + v);
            }

            targetedEnemy.stats.currentHp = Math.max(targetedEnemy.stats.currentHp - damage, 0);
            let name = targetedEnemy.name;

            let deadS = " (DEAD, DM clear with " + prefix + "removeEnemy)";
            if (targetedEnemy.stats.currentHp == 0 && targetedEnemy.name.indexOf(deadS) == -1) {
                targetedEnemy.name = targetedEnemy.name + deadS;
            }

            dndIO.writeGroup(platformObject.server, group);

            return await sendMessage(name + " took " + damage + " points of damage. " + flavor[getFlavorIndex(targetedEnemy.stats.currentHp / targetedEnemy.stats.hp)]);
        }
    } else if (args[0] == "/heal") {
        let heal = parseInt(args[args.length - 1]);
        if (args.length == 1 || (args.length == 2 && isNaN(heal))) {
            return await sendMessage("USAGE by Players: " + args[0] + "X - Heal your own character for X.\nUSAGE by Players on Enemies: " + args[0] + " 0 X - Heals active enemy 0 for X.\n\nUSAGE by DM on Players or Players on Players: " + args[0] + " @user X - Heals @user's character for X.");
        }
        
        if (isNaN(heal) || heal < 0) {
            return await sendMessage(args[args.length - 1] + " is not a health quantity. Please use a valid positive integer.");
        }

        function getFlavorIndex(percent) {
            let r = 0;
            if (percent > 0.65)
                r = 0;
            else if (percent > 0.5)
                r = 1;
            else if (percent > 0.35)
                r = 2;
            else if (percent > 0.15)
                r = 3;
            else if (percent > 0)
                r = 4;
            else   
                r = 5;

            return r;
        }

        let flavor = [
            "They look to be in good health.",
            "They feel better, but still look a little rough around the edges.",
            "Their condition improved, but they still look worse for wear.",
            "Their condition improved somewhat, but they still look unwell.",
            "They still look quite bloodied.",
            "Their hit points are still at 0."
        ]

        //targeting user
        if (platformObject.mentions.length > 0) {
            let targetedUser = dndIO.getUser(platformObject.mentions[0].id, null);
            if (!targetedUser) {
                return await sendMessage("I do not have any stored information about " + platformObject.mentions[0].username);
            }

            if (group.players[targetedUser.id] == undefined) {
                return await sendMessage(targetedUser.username + " has not yet posted in this chat, and/or has not set their Active Player Character in this chat by using the " + prefix + "character command.");
            }

            if (targetedUser.id == group.dm) {
                return await sendMessage("You cannot target the DM directly.");
            }

            let targetedCharacter = dndIO.getCharacterAt(targetedUser.id, group.players[targetedUser.id]);
            if (!targetedCharacter) {
                return await sendMessage("Unable to find " + targetedUser.username + "'s Character at Index " + group.players[targetedUser.id] + ". This shouldn't really happen so reach out to the Developer with this if you could.");
            }

            targetedCharacter.stats.currentHp = Math.min(targetedCharacter.stats.currentHp + heal, targetedCharacter.stats.hp);
            dndIO.writeCharacterAt(targetedUser.id, group.players[targetedUser.id], targetedCharacter);

            return await sendMessage(targetedCharacter.name + " healed " + heal + " points of damage. " + flavor[getFlavorIndex(targetedCharacter.stats.currentHp / targetedCharacter.stats.hp)]);
        } else if (args.length > 2) {
            let v = parseInt(args[1]); //enemy index
            if (isNaN(v)) {
                return await sendMessage("Invalid Enemy Index specified. To target the first enemy, use " + args[0] + " 0 " + args[args.length - 1]);
            }
            
            if (v >= group.enemies.length) {
                return await sendMessage("Invalid Enemy Index specified. View currently active enemies with " + prefix + "enemies");
            }

            let targetedEnemy = group.enemies[v];
            if (!targetedEnemy) {
                return await sendMessage("Unable to find the Enemy at Index " + v);
            }

            targetedEnemy.stats.currentHp = Math.min(targetedEnemy.stats.currentHp + heal, targetedEnemy.stats.hp);
            let name = targetedEnemy.name;

            let indOf = targetedEnemy.name.indexOf(" (DEAD, DM clear with " + prefix + "removeEnemy)");
            if (indOf >= 0) {
                targetedEnemy.name = targetedEnemy.name.substring(0, indOf);
            }

            dndIO.writeGroup(platformObject.server, group);

            return await sendMessage(name + " healed " + heal + " points of damage. " + flavor[getFlavorIndex(targetedEnemy.stats.currentHp / targetedEnemy.stats.hp)]);
        } else {
            //healing yourself
            character.stats.currentHp = Math.min(character.stats.currentHp + heal, character.stats.hp);
            dndIO.writeCharacter(user.id, character);

            return await sendMessage(character.name + " healed " + heal + " points of damage. " + flavor[getFlavorIndex(character.stats.currentHp / character.stats.hp)]);
        }
    } else if (args[0] == "/restoresp") {
        let heal = parseInt(args[args.length - 1]);
        if (args.length == 1 || (args.length == 2 && isNaN(heal))) {
            return await sendMessage("USAGE by Players: " + args[0] + "X - Restore your own character's SP by X.\nUSAGE by DM on Players or Players on Players: " + args[0] + " @user X - Heals @user's character for X.");
        }
        
        if (isNaN(heal) || heal < 0) {
            return await sendMessage(args[args.length - 1] + " is not a valid SP quantity. Please use a valid positive integer.");
        }

        //targeting user
        if (platformObject.mentions.length > 0) {
            let targetedUser = dndIO.getUser(platformObject.mentions[0].id, null);
            if (!targetedUser) {
                return await sendMessage("I do not have any stored information about " + platformObject.mentions[0].username);
            }

            if (group.players[targetedUser.id] == undefined) {
                return await sendMessage(targetedUser.username + " has not yet posted in this chat, and/or has not set their Active Player Character in this chat by using the " + prefix + "character command.");
            }

            if (targetedUser.id == group.dm) {
                return await sendMessage("You cannot target the DM directly.");
            }

            let targetedCharacter = dndIO.getCharacterAt(targetedUser.id, group.players[targetedUser.id]);
            if (!targetedCharacter) {
                return await sendMessage("Unable to find " + targetedUser.username + "'s Character at Index " + group.players[targetedUser.id] + ". This shouldn't really happen so reach out to the Developer with this if you could.");
            }

            targetedCharacter.stats.sp = Math.min(targetedCharacter.stats.sp + heal, targetedCharacter.stats.maxSp);
            dndIO.writeCharacterAt(targetedUser.id, group.players[targetedUser.id], targetedCharacter);

            return await sendMessage(targetedCharacter.name + " restored " + heal + " SP. They are now at " + targetedCharacter.stats.sp + " SP.");
        } else {
            //healing yourself
            character.stats.sp = Math.min(character.stats.sp + heal, character.stats.maxSp);
            dndIO.writeCharacter(user.id, character);

            return await sendMessage(character.name + " restored " + heal + " SP. They are now at " + character.stats.sp + " SP.");
        }
    } else if (args[0] == "/enemies") {
        let s = "Currently Spawned Enemies:\n\n";
        for (let i = 0; i < group.enemies.length; i++) {
            s += i.toString() + ": " + group.enemies[i].name + "\n";
        }

        return await sendMessage(s);
    } else if (args[0] == "/pay") {
        if (args.length < 2) {
            return await sendMessage("Usage: " + args[0] + " @user 150 - Would give 150gp to @user's active character. If this is from another player, that 150gp will be deducted from their total. " + prefix + "pay 5 - Would simply deduct 5gp from the player's total. Used to buy things in shops.");
        }

        if (args.length >= 3 && platformObject.mentions.length > 0) {
            let v = parseInt(args[args.length - 1]);
            if (isNaN(v) || v < 0) {
                return await sendMessage(args[args.length - 1] + " is not a valid quantity of money to give. Please type a valid integer.");
            }

            let targetedUser = dndIO.getUser(platformObject.mentions[0].id);
            if (!targetedUser) {
                return await sendMessage("Could not find any information about " + platformObject.mentions[0].username);
            }

            if (group.players[targetedUser.id] == undefined) {
                return await sendMessage("It seems " + platformObject.mentions[0].username + " has not yet participated in this group.");
            }

            let targetedCharacter = dndIO.getCharacterAt(targetedUser.id, group.players[targetedUser.id]);
            if (!targetedCharacter) {
                return await sendMessage("Unable to find the appropriate character belonging to " + targetedUser.username);
            }

            if (group.dm != user.id) {
                //see if operation is possible. if yes, deduct money
                if (parseInt(character.money) >= v) {
                    character.money = parseInt(character.money) - v;
                    dndIO.writeCharacter(user.id, character);
                } else {
                    return await sendMessage(character.name + " has " + character.money + "gp - they cannot afford to pay " + v + "gp. Come back when they're a little, mmmmmm, richer.");
                }
            }

            targetedCharacter.money = parseInt(targetedCharacter.money) + v;
            dndIO.writeCharacterAt(targetedUser.id, group.players[targetedUser.id], targetedCharacter);

            let n = (group.dm == user.id) ? "Successfully paid " : character.name + " successfully paid ";

            return await sendMessage(n + targetedCharacter.name + " " + v + "gp.");
        } else if (args.length == 2) {
            //pay out of pocket to no one
            let v = parseInt(args[args.length - 1]);
            if (isNaN(v) || v < 0) {
                return await sendMessage(args[args.length - 1] + " is not a valid quantity of money to give. Please type a valid integer.");
            }

            if (parseInt(character.money) >= v) {
                character.money = parseInt(character.money) - v;
                dndIO.writeCharacter(user.id, character);
                return await sendMessage(character.name + " paid " + v + "gp.");
            } else {
                return await sendMessage(character.name + " has " + character.money + "gp - they cannot afford to pay " + v + "gp. Come back when they're a little, mmmmmm, richer.");
            }
        }
    } else if (personaSpellNames.indexOf(args[0]) != -1) {
        let spell = null;
        for (let ps of personaSpells) {
            if ("/" + ps.name == args[0]) {
                spell = ps;
                break;
            }
        }
        if (spell == null) {
            return await sendMessage("Uh, couldn't find that spell? Even though I know it's a spell somehow? Ask Adam.");
        }
        character.stats.sp = parseInt(character.stats.sp);
        let spellTitle = spell.name[0].toUpperCase() + spell.name.substr(1);

        if (character.stats.sp < spell.cost) {
            return await sendMessage(character.name + " only has " + character.stats.sp + " SP - not enough to cast " + spellTitle + ". (" + spell.cost + " SP)");
        }

        character.stats.sp = character.stats.sp - spell.cost;
        let diceMessage = "";
        if (spell.dice) {
            diceMessage = await handleRoll("/" + spell.dice);
        }

        dndIO.writeCharacter(user.id, character);
        let ret = character.name + " cast " + spellTitle + " for " + spell.cost + " SP. They have " + character.stats.sp + " SP remaining.";
        if (diceMessage) {
            ret += "\n\n" + diceMessage;
        }
        return await sendMessage(ret);
    }
}

module.exports.handle = handle;
