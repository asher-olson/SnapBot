// INVITE: https://discord.com/api/oauth2/authorize?client_id=1063604736017846305&permissions=533046099008&scope=bot

import * as Discord from "discord.js";
import { MongoClient } from "mongodb";
import * as fs from "fs";
import lodash from "lodash";
import { randomDeck } from "./randomDeck.js";
import { CardService } from "./CardService.js";

const {replace, includes} = lodash;

const secrets = JSON.parse(fs.readFileSync('secrets.json'));
// const uri = `mongodb+srv://${secrets.mongoUser}:${secrets.mongoPass}@cluster0.mn0nlma.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri);

const cardService = new CardService();

const bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

bot.on('messageCreate', async (msg) => {
    if(msg.author.bot) {
        return;
    }

    const content = msg.content;

    const searchRegex = /^{{.*}}$/i;
    if(searchRegex.test(content)) {
        const name = replace(content.slice(2, -2), / /g, "");
        const card = cardService.getCardByName(name);
        if(!!card) {
            const file = fs.readFileSync(card.webp_path);
            await msg.channel.send({files: [{ attachment: file }]});
            msg.channel.send(card.ability);
        }
    }

    
    
})



const botLogin = secrets.botLogin;
bot.login(botLogin);
console.log(randomDeck())
