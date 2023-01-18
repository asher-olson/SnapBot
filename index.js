// INVITE: https://discord.com/api/oauth2/authorize?client_id=1063604736017846305&permissions=533046099008&scope=bot

// import * as Discord from "discord.js";
import discord from "discord.js";
import { MongoClient } from "mongodb";
import * as fs from "fs";
import lodash from "lodash";
import { randomDeck } from "./randomDeck.js";
import { CardService } from "./CardService.js";

const {replace, includes} = lodash;
const { Client, Events, ActionRowBuilder, MessageButtonStyle, ButtonBuilder, GatewayIntentBits, ButtonStyle } = discord;

const secrets = JSON.parse(fs.readFileSync('secrets.json'));
// const uri = `mongodb+srv://${secrets.mongoUser}:${secrets.mongoPass}@cluster0.mn0nlma.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri);

const cardService = new CardService();

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

bot.on('messageCreate', async (msg) => {
    if(msg.author.bot) {
        return;
    }

    const content = msg.content;

    const searchRegex = /^{{.*}}$/i;
    if(searchRegex.test(content)) {
        // const name = replace(content.slice(2, -2), / /g, "");
        // const card = cardService.getCardByName(name);
        // if(!!card) {
        //     const file = fs.readFileSync(card.webp_path);
        //     await msg.channel.send({files: [{ attachment: file }]});
        //     msg.channel.send(card.ability);
        // }

        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('primary')
					.setLabel('Click me!')
					.setStyle(ButtonStyle.Primary),
			);

        await msg.reply({ content: 'I think you should,', components: [row] });
        
        const filter = i => i.customId === 'primary';
        const collector = msg.channel.createMessageComponentCollector({filter, time: 15000});

        collector.on('collect', async i => {
            await i.update({ content: "a button was click", components: []});
        });

        collector.on('end', collected => console.log(`Collected ${collected.size} size`));


    }

    
    
});

bot.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    if(interaction.commandName === 'button') {
        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('primary')
					.setLabel('Click me!')
					.setStyle(ButtonStyle.Primary),
			);

        await interaction.reply({ content: 'I think you should,', components: [row] });
    }
}) 



const botLogin = secrets.botLogin;
bot.login(botLogin);
console.log(randomDeck())
