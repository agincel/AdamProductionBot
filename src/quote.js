/*
    quote.js 

    Handle all things relating to responding with or storing quoted messages.
    (C) Adam Gincel - 2018
*/  

const fs = require("fs");
const send = require("./send.js");

async function handle(text, platformObject, args, msgToQuote, bots) {
    async function sendMessage (text) {
        return await send.genericSendMessage(text, platformObject, bots);
    }
    if (args[0] == "/quoteadd" && msgToQuote) {
        let quotesPath = "./quotes/" + platformObject.server + "Quotes.json";
        if (fs.existsSync(quotesPath)) {
            let quoteList = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));
            let newQuote = {};
            newQuote.text = msgToQuote.text;
            newQuote.author = msgToQuote.from.username ? msgToQuote.from.username : msgToQuote.from.first_name;
            quoteList.push(newQuote);
            fs.writeFileSync(quotesPath, JSON.stringify(quoteList), "utf8");
            return await sendMessage("Quote " + quoteList.length.toString() + " from " + newQuote.author + " has been added to the database.");
        } else {
            let newQuote = {};
            newQuote.text = msgToQuote.text;
            newQuote.author = msgToQuote.from.username ? msgToQuote.from.username : msgToQuote.from.first_name;
            let quoteList = [newQuote];
            fs.writeFileSync(quotesPath, JSON.stringify(quoteList), "utf8"); //this might not work?
            return await sendMessage("Quote " + quoteList.length.toString() + " from " + newQuote.author + " has been added to the database.");
        }
    } else if (args[0] == "/quote") {
        let quotesPath = "./quotes/" + platformObject.server + "Quotes.json";
        if (!fs.existsSync(quotesPath)) {
            return await sendMessage("No quote database found for this server.");
        } else {
            let quoteList = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));
            if (args.length < 2) {
                //choose a random quote
                let selectedQuote = quoteList[Math.floor(Math.random()*quoteList.length)];
                return await sendMessage("\"" + selectedQuote.text + "\" - " + selectedQuote.author);
            } else if (parseInt(args[1])) {
                //find quote at index and return it
                let index = parseInt(args[1]);
                if (index >= 0 && index < quoteList.length) {
                    let selectedQuote = quoteList[index];
                    return await sendMessage("\"" + selectedQuote.text + "\" - " + selectedQuote.author);
                } else {
                    return await sendMessage("That index was not found in the quote database.");
                }
            }
        }
    }
}

module.exports.handle = handle;