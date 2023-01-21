// INVITE: https://discord.com/api/oauth2/authorize?client_id=1063604736017846305&permissions=533046099008&scope=bot

// import * as Discord from "discord.js";
import discord from "discord.js";
import { MongoClient } from "mongodb";
import * as fs from "fs";
import lodash from "lodash";
import { randomDeck } from "./randomDeck.js";
import { CardService } from "./CardService.js";
import { CollectorService } from "./CollectorService.js";

const {replace, includes, map, forEach} = lodash;
const { Client, Events, ActionRowBuilder, MessageButtonStyle, ButtonBuilder, GatewayIntentBits, ButtonStyle } = discord;

const secrets = JSON.parse(fs.readFileSync('secrets.json'));
// const uri = `mongodb+srv://${secrets.mongoUser}:${secrets.mongoPass}@cluster0.mn0nlma.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri);

const cardService = new CardService();

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


// takes card json from cards.js and makes an array of up to 5 action rows of length 5
// (discord limits to 5 rows and 5 buttons per row)
function buildVariantActionBarsFromCard(card) {
    const buttons = map(card['variant_paths'], (variant) => {
        return new ButtonBuilder()
            .setCustomId(variant.path)
            .setLabel(variant.name)
            .setStyle(ButtonStyle.Secondary)
    });
    const baseButton = new ButtonBuilder()
        .setCustomId(card.webp_path)
        .setLabel("Base")
        .setStyle(ButtonStyle.Primary)  // default base to active
    
    const rows = [];
    let row = [baseButton];
    forEach(buttons, (button) => {
        if(rows.length >= 5) {
            return;
        }
        row.push(button);
        if(row.length >= 5) {
            rows.push(new ActionRowBuilder().addComponents(row));
            row = [];
        }
    });
    if(rows.length < 5 && row.length !== 0) {
        rows.push(new ActionRowBuilder().addComponents(row));
    }

    return rows;
}

function findButtonByCustomId(rows, id) {
    let kekw = new CollectorService();
    // console.log(id);
    // console.log(rows[0].components[0]);
    let button;
    forEach(rows, (row) => {
        forEach(row.components, (but) => {
            // console.log(but);
            if(but.data.custom_id === id) {
                button = but;
            }
        })
    });
    // console.log(button.data.custom_id);
    return button;
}


bot.on('messageCreate', async (msg) => {
    if(msg.author.bot) {
        return;
    }

    const content = msg.content;

    const searchRegex = /^{{.*}}$/i;
    if(searchRegex.test(content)) {
        const name = replace(content.slice(2, -2), / /g, "");
        const card = cardService.getCardByName(name);
        if(!card) {
            return;
        }

        const file = fs.readFileSync(card.webp_path);
        // await msg.channel.send({files: [{ attachment: file }]});
        // msg.channel.send(card.ability);

        const rows = buildVariantActionBarsFromCard(card);

        await msg.reply({ content: card.ability, components: rows, files: [{ attachment: file }] });
        
        let selectedButton = rows[0].components[0];
        const filter = (i) => {
            const button = findButtonByCustomId(rows, i.customId);
            if(!!button) {
                selectedButton.data.style = ButtonStyle.Secondary;
                button.data.style = ButtonStyle.Primary;
                selectedButton = button;
            }
            return !!button;
        }
        const collector = msg.channel.createMessageComponentCollector({filter, time: 15000});
        // forEach(rows, (row) => {
        //     forEach(row, (button) => {
        //         const filter = b => b.customId === button.customId;
        //         const collector = msg.channel.createMessageComponentCollector({filter, time: 15000});

        //         collector.on('collect', async i => {
        //             console.log(button.customId);
        //         })
        //     })
        // })

        collector.on('collect', async i => {
            console.log(selectedButton);
            const file = fs.readFileSync(selectedButton.data.custom_id);
            await i.update({ components: rows, files: [{ attachment: file }] });
        });

        collector.on('end', collected => console.log(`Collected ${collected.size} size`));


    }

    
    
});

// bot.on(Events.InteractionCreate, async interaction => {
//     if (!interaction.isChatInputCommand()) {
//         return;
//     }

//     if(interaction.commandName === 'button') {
//         const row = new ActionRowBuilder()
// 			.addComponents(
// 				new ButtonBuilder()
// 					.setCustomId('primary')
// 					.setLabel('Click me!')
// 					.setStyle(ButtonStyle.Primary),
// 			);

//         await interaction.reply({ content: 'I think you should,', components: [row] });
//     }
// }) 



const botLogin = secrets.botLogin;
bot.login(botLogin);
console.log(randomDeck())
