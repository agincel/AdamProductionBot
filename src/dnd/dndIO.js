/*
    dndIO.js

    Includes all File I/O for the bot's DnD module.
    (C) Adam Gincel - 2019
*/

const fs = require("fs");


const userPath = "./dnd/users/";
const groupPath = "./dnd/groups/";
const schemaPath = "./dnd/schemas/";

let users = {};
let groups = {};

function load() {
    loadUsers();
    loadGroups();
}

function loadUsers() {
    let userFilenames = fs.readdirSync(userPath);
    for (let i = 0; i < userFilenames.length; i++) {
        if (userFilenames[i] != "schema.json") {
            let user = getUser(userFilenames[i].split(".json")[0], ""); //JSON.parse(fs.readFileSync(dataPath + userFilenames[i], "utf8"));
            users[user.id] = user;
        }
    }
    console.log("Loaded users into RAM");
}

function getUserPath(id) {
    return userPath + id + ".json";
}

//Overwrite a stored user with the given modified user object
function writeUser(id, user) {
    let userPath = getUserPath(id);
    try {
        fs.writeFileSync(userPath, JSON.stringify(user, "", "\t"), "utf8");
        users[id] = user;
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

//Creates user from template schema.json file, overwrites `id` and `username`, then writes that user to memory and to cache.
function createUser(id, username) {
    let templateUser = JSON.parse(fs.readFileSync(schemaPath + "user.json", "utf8"));
    templateUser.id = id;
    if (username)
        templateUser.username = username;
    writeUser(id, templateUser);
}

/*
    Returns user by ID.
    Creates user if not found.
    Updates username each time called.
    Caches user in RAM users.
*/
function getUser(id, username) {
    let userPath = getUserPath(id);
    if (!fs.existsSync(userPath)) {
        //if we don't have a user by this ID, create them!
        createUser(id, username);
    }
    
    //pull user from cached users
    //if not found, read them from file, then cache them
    let userData = users[id];
    if (!userData) {
        userData = JSON.parse(fs.readFileSync(userPath, "utf8"));
        users[id] = userData;
    }

    //set or update username, if applicable
    if (username && (!userData.username || userData.username != username)) {
        userData.username = username;
        writeUser(id, userData);
    }

    //any new fields not from original schema to add to all objects
    /*if (userData.newField == undefined) {
        userData.newField = 0;
        writeUser(id, userData);
    }*/

    return userData;
}

function getUserByUsername(username) {
    let userKeys = Object.keys(users);
    for (let i = 0; i < userKeys.length; i++) {
        let user = users[userKeys[i]];
        console.log(user);

        if (user.username == username) 
            return user;
    }
    return null;
}

function createCharacter(id, characterName) {
    let user = getUser(id, null);
    let templateCharacter = JSON.parse(fs.readFileSync(schemaPath + "character.json", "utf8"));
    templateCharacter.name = characterName;
    user.characters.push(templateCharacter);
    user.activeCharacter = user.characters.length - 1;
    writeUser(id, user);
}

function writeCharacter(id, character) {
    let user = getUser(id, null);
    user.characters[user.activeCharacter] = character;
    writeUser(id, user);
}

function writeCharacterAt(id, ind, character) {
    let user = getUser(id, null);
    user.characters[ind] = character;
    writeUser(id, user);
}

function createEnemy(id, enemyName) {
    let user = getUser(id, null);
    let templateEnemy = JSON.parse(fs.readFileSync(schemaPath + "/enemy.json", "utf8"));
    templateEnemy.name = enemyName;
    user.enemies.push(templateEnemy);
    writeUser(id, user);
}

function writeEnemy(id, ind, enemy) {
    let user = getUser(id, null);
    user.enemies[ind] = enemy;
    writeUser(id, user);
}

function getCharacter(id) {
    let user = getUser(id, null);
    if (user.activeCharacter >= 0 && user.characters[user.activeCharacter]) {
        return user.characters[user.activeCharacter];
    }
    return null;
}

function getCharacterAt(id, ind) {
    let user = getUser(id, null);
    if (user.characters[ind]) {
        return user.characters[ind];
    }
    return null;
}

function getEnemy(id, ind) {
    let user = getUser(id, null);
    if (user.enemies[ind]) {
        return user.enemies[ind];
    }
    return null;
}

function getChosenStat(statName) {
    let stats = ["hp", "currentHp", "ac", "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    let chosenStat = "";
    for (let i = 0; i < stats.length; i++) {
        if (statName.length >= 2 && stats[i].toLowerCase().startsWith(statName.toLowerCase())) {
            chosenStat = stats[i];
            break;
        }
    }

    return chosenStat;
}

function getChosenList(listCommandName) {
    let map = {
        "/addtrait": "traits",
        "/removetrait": "traits",
        "/additem": "inventory",
        "/removeitem": "inventory",
        "/addinventory": "inventory",
        "/removeinventory": "inventory",
        "/addspell": "spells",
        "/removespell": "spells",
        "/addequipment": "equipment",
        "/removeequipment": "equipment",
        "/addequip": "equipment",
        "/removeequip": "equipment",
        "inventory": "inventory"
    };
    if (map[listCommandName])
        return map[listCommandName];
    return null;
}

function setCharacterStat(id, statName, value) {
    let character = getCharacter(id);
    if (!character) {
        return false;
    }
    
    let chosenStat = getChosenStat(statName);

    if (!chosenStat)
        return false;
    
    character.stats[chosenStat] = value;
    writeCharacter(id, character);
    return true;
}

function getCharacterStat(id, statName) {
    let character = getCharacter(id);
    if (!character) {
        return false;
    }

    let chosenStat = getChosenStat(statName);

    if (!chosenStat) {
        return false;
    }

    return character.stats[chosenStat];
}

function setEnemyStat(id, ind, statName, value) {
    let enemy = getEnemy(id, ind);
    if (!enemy) {
        return false;
    }
    
    let chosenStat = getChosenStat(statName);

    if (!chosenStat)
        return false;
    
    enemy.stats[chosenStat] = value;
    writeEnemy(id, ind, enemy);
    return true;
}

function setCharacterTrait(id, fieldName, value) {
    let character = getCharacter(id);
    if (!character) {
        return false;
    }

    character[fieldName.toLowerCase()] = value;

    writeCharacter(id, character);
    return true;
}

function setEnemyTrait(id, ind, fieldName, value) {
    let enemy = getEnemy(id, ind);
    if (!enemy) {
        return false;
    }

    enemy[fieldName.toLowerCase()] = value;

    writeEnemy(id, ind, enemy);
    return true;
}

function addCharacterList(id, listName, valueToAdd) {
    let character = getCharacter(id);
    if (!character) {
        return false;
    }

    let chosenList = getChosenList(listName);
    if (!chosenList) {
        return false;
    }

    character[chosenList].push(valueToAdd);

    writeCharacter(id, character);
    return true;
}

function removeCharacterList(id, listName, indexToRemove) {
    let character = getCharacter(id);
    if (!character) {
        return false;
    }

    let chosenList = getChosenList(listName);
    if (!chosenList) {
        return false;
    }

    if (indexToRemove >= character[chosenList].length) {
        return false;
    }

    character[chosenList].splice(indexToRemove, 1);

    writeCharacter(id, character);
    return true;
}

function addEnemyList(id, ind, listName, valueToAdd) {
    let enemy = getEnemy(id, ind);
    if (!enemy) {
        return false;
    }

    let chosenList = getChosenList(listName);
    if (!chosenList) {
        return false;
    }

    enemy[chosenList].push(valueToAdd);

    writeEnemy(id, ind, enemy);
    return true;
}

function removeEnemyList(id, ind, listName, indexToRemove) {
    let enemy = getEnemy(id, ind);
    if (!enemy) {
        return false;
    }

    let chosenList = getChosenList(listName);
    if (!chosenList) {
        return false;
    }

    if (indexToRemove >= enemy[chosenList].length) {
        return false;
    }


    enemy[chosenList].splice(indexToRemove, 1);
    writeEnemy(id, ind, enemy);
    return true;
}

//-------------------------------

function loadGroups() {
    let groupFilenames = fs.readdirSync(groupPath);
    for (let i = 0; i < groupFilenames.length; i++) {
        if (groupFilenames[i] != "schema.json") {
            let group = getGroup(groupFilenames[i].split(".json")[0]); //JSON.parse(fs.readFileSync(dataPath + userFilenames[i], "utf8"));
            groups[group.id] = group;
        }
    }
    console.log("Loaded groups into RAM");
}

function getGroupPath(id) {
    return groupPath + id + ".json";
}

//Overwrite a stored group with the given modified group object
function writeGroup(id, group) {
    let groupPath = getGroupPath(id);
    try {
        fs.writeFileSync(groupPath, JSON.stringify(group, "", "\t"), "utf8");
        groups[id] = group;
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

//Creates group from template schema.json file, overwrites `id`, then writes that group to memory and to cache.
function createGroup(id) {
    let templateGroup = JSON.parse(fs.readFileSync(schemaPath + "group.json", "utf8"));
    templateGroup.id = id;
    writeGroup(id, templateGroup);
}

/*
    Returns group by ID.
    Creates group if not found.
    Caches group in RAM groups.
*/
function getGroup(id) {
    let groupPath = getGroupPath(id);
    if (!fs.existsSync(groupPath)) {
        //if we don't have a group by this ID, create them!
        createGroup(id);
    }
    
    //pull group from cached groups
    //if not found, read them from file, then cache them
    let groupData = groups[id];
    if (!groupData) {
        groupData = JSON.parse(fs.readFileSync(groupPath, "utf8"));
        groups[id] = groupData;
    }

    //any new fields not from original schema to add to all objects
    if (groupData.players == undefined) {
        groupData.players = {};
        writeGroup(id, groupData);
    }

    return groupData;
}


module.exports.load = load;
module.exports.getUser = getUser;
module.exports.getUserByUsername = getUserByUsername;
module.exports.getGroup = getGroup;
module.exports.writeUser = writeUser;
module.exports.writeGroup = writeGroup;
module.exports.createUser = createUser;
module.exports.createGroup = createGroup;

module.exports.createCharacter = createCharacter;
module.exports.createEnemy = createEnemy;
module.exports.writeEnemy = writeEnemy;
module.exports.getCharacter = getCharacter;
module.exports.getCharacterAt = getCharacterAt;
module.exports.writeCharacter = writeCharacter;
module.exports.writeCharacterAt = writeCharacterAt;
module.exports.getEnemy = getEnemy;
module.exports.getCharacterStat = getCharacterStat;
module.exports.setCharacterStat = setCharacterStat;
module.exports.setEnemyStat = setEnemyStat;
module.exports.setCharacterTrait = setCharacterTrait;
module.exports.setEnemyTrait = setEnemyTrait;
module.exports.addCharacterList = addCharacterList;
module.exports.removeCharacterList = removeCharacterList;
module.exports.addEnemyList = addEnemyList;
module.exports.removeEnemyList = removeEnemyList;