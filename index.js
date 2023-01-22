// INVITE: https://discord.com/api/oauth2/authorize?client_id=1063604736017846305&permissions=533046099008&scope=bot

import discord from "discord.js";
import * as fs from "fs";
import lodash from "lodash";
import { randomDeck } from "./randomDeck.js";
import { CardService } from "./CardService.js";


const {replace, includes, map, forEach} = lodash;
const { Client, Events, ActionRowBuilder, MessageButtonStyle, ButtonBuilder, GatewayIntentBits, ButtonStyle } = discord;

const secrets = JSON.parse(fs.readFileSync('secrets.json'));

CardService.readCardsJSON();

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
    let button;
    forEach(rows, (row) => {
        forEach(row.components, (btn) => {
            if(btn.data.custom_id === id) {
                button = btn;
            }
        })
    });
  
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
        const card = CardService.getCardByName(name);
        if(!card) {
            return;
        }

        const file = fs.readFileSync(card.webp_path);

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
        const collector = msg.channel.createMessageComponentCollector({filter, time: 300000});

        collector.on('collect', async i => {
            const file = fs.readFileSync(selectedButton.data.custom_id);
            await i.update({ components: rows, files: [{ attachment: file }] });
        });

        collector.on('end', collected => console.log("Collecter ended"));


    }

    
    
});


const botLogin = secrets.botLogin;
bot.login(botLogin);
