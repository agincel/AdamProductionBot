/*
    likes.js 

    Handles liking and disliking a user.
    (C) Adam Gincel - 2018
*/  

const fs = require("fs");
const sha = require("sha1");
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
    let likeHash = sha(platformObject.replyID + platformObject.userID);
    if ((args[0] == "/like" || args[0] == "/love") && idToVote && !likingSelf) {
        if (likes[idToVote] && likes[idToVote].likes.indexOf(likeHash) == -1) {
            likes[idToVote].likes.push(likeHash);
	    if (args[0] == "/love")
		likes[idToVote].likes.push(likeHash); //worth 2
        } else if (!likes[idToVote]) {
            likes[idToVote] = {likes: [likeHash], dislikes: []};
	    if (args[0] == "/love")
		likes[idToVote].likes.push(likeHash); //worth 2
        }
        fs.writeFileSync("./likes/likes.json", JSON.stringify(likes), "utf8");
    } else if ((args[0] == "/dislike" || args[0] == "/hate") && idToVote && !likingSelf) {
        if (likes[idToVote] && likes[idToVote].dislikes.indexOf(likeHash) == -1) {
            likes[idToVote].dislikes.push(likeHash);
	    if (args[0] == "/hate")
		likes[idToVote].dislikes.push(likeHash); //worth -2
        } else if (!likes[idToVote]) {
            likes[idToVote] = {likes: [], dislikes: [likeHash]};
	    if (args[0] == "/hate")
		likes[idToVote].dislikes.push(likeHash); //worth -2
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
