/*
    likes.js 

    Handles liking and disliking a user.
    (C) Adam Gincel - 2018
*/  

const fs = require("fs");
const send = require("./send.js");

async function handle(args, platformObject, idToVote, bots) {
    async function sendMessage (text) {
        return await send.genericSendMessage(text, platformObject, bots);
    }

    if (!fs.existsSync("./likes/likes.json")) {
        fs.writeFileSync("./likes/likes.json", JSON.stringify({}), "utf8");
    }

    let likingSelf = platformObject.userID == idToVote;


    let likes = JSON.parse(fs.readFileSync("./likes/likes.json", 'utf8'));
    if (args[0] == "/like" && idToVote && !likingSelf) {   
        if (likes[idToVote] && likes[idToVote].likes.indexOf(platformObject.replyID) == -1) {
            likes[idToVote].likes.push(platformObject.replyID);
        } else {
            likes[idToVote] = {likes: [platformObject.replyID, dislikes: []};
        }
        fs.writeFileSync("./likes/likes.json", JSON.stringify(likes), "utf8");
    } else if (args[0] == "/dislike" && idToVote && !likingSelf) {
        if (likes[idToVote] && likes[idToVote].dislikes.indexOf(platformObject.replyID) == -1) {
            likes[idToVote].dislikes.push(platformObject.replyID);
        } else {
            likes[idToVote] = {likes: [], dislikes: [platformObject.replyID]};
        }
        fs.writeFileSync("./likes/likes.json", JSON.stringify(likes), "utf8");
    } else if ((args[0] == "/likes" || args[0] == "/karma")) {
        let idToVote = platformObject.userID;
        if (likes[idToVote]) {
            return await sendMessage("You currently have " + likes[idToVote].likes.length.toString() + " likes and " + likes[idToVote].dislikes.length.toString() + " dislikes, for a total of " + (likes[idToVote].likes.length - likes[idToVote].dislikes.length).toString() + " karma.");
        } else {
            return await sendMessage("You currently do not have any likes or dislikes.");
        }
    }
}

module.exports.handle = handle;