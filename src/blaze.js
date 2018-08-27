/*
    blaze.js 

    Handling of the time-sensitive game.
    (C) Adam Gincel - 2018
*/  

const send = require("./send.js");
const fs = require("fs");

const am = 4;
const pm = am + 12;
const minute = 20;
const utcOffset = 0;

async function handle(text, platformObject, args, bots) {
    async function sendMessage (text) {
        return await send.genericSendMessage(text, platformObject, bots);
    }
    async function editMessage(text, msg) {
        return await send.genericEditMessage(text, platformObject, bots, msg);
    }

    let currentDate = new Date(platformObject.time);
    if (!fs.existsSync("./blaze.json")) {
	fs.writeFileSync("./blaze.json", "{}", "utf8");
    }
    let blaze = JSON.parse(fs.readFileSync("./blaze.json", "utf8"));

    let u = {
	id: platformObject.userID,
	name: platformObject.name
    };

    if (args[0] == "/blaze") {
	let h = currentDate.getHours() + utcOffset;
	if (currentDate.getMinutes() == minute && (h == am || h == pm)) {
		if (!blaze[u.id])
			blaze[u.id] = {name: u.name, score: 0, lastDate: ""};
		if (!blaze[u.id].lastDate || currentDate - 120000 > new Date(blaze[u.id].lastDate)) {
			const points = 6 - Math.floor(currentDate.getSeconds() / 10);
			blaze[u.id].score += points;
			blaze[u.id].lastDate = currentDate;

			fs.writeFileSync("./blaze.json", JSON.stringify(blaze, null, "\t"), "utf8");
			return await sendMessage(u.name + " blazed it at " + currentDate.getSeconds().toString() + " seconds!\n\n+" + points.toString() + "\n--------\nTotal: " + blaze[u.id].score.toString() + " points");
		} else {
			return await sendMessage(u.name + ", you already blazed it. Come back later!");
		}
	} else {
		if (!blaze[u.id]) {
			return await sendMessage(u.name + ", you are not yet on the Blaze Leaderboard.");
		} else {
			return await sendMessage(u.name + ", you currently have " + blaze[u.id].score.toString() + " points.");
		}
	}
    } else if (args[0] == "/blazetime") {
	let h = currentDate.getHours() + utcOffset;
	h = h > 12 ? h - 12 : h;
	return await sendMessage("My clock thinks it is " + h.toString() + "h " + currentDate.getMinutes().toString() + "m " + currentDate.getSeconds().toString() + "s.");
    } else if (args[0] == "/leaderboard") {
	let k = Object.keys(blaze);
	let entries = [];
	for (let i = 0; i < k.length; i++)
		entries.push(blaze[k[i]]);
	entries.sort((a, b) => a.score < b.score);
	let s = "Blaze Leaderboard:\n";
	for (let i = 0; i < entries.length; i++) {
		s += "`" + entries[i].name + ": " + entries[i].score.toString() + "`\n";
	}
	return await sendMessage(s);
    }
}

module.exports.handle = handle;
