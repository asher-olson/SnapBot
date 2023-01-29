// INVITE: https://discord.com/api/oauth2/authorize?client_id=1063604736017846305&permissions=533046099008&scope=bot

import discord from "discord.js";
import * as fs from "fs";
import lodash from "lodash";
import { randomDeck } from "./randomDeck.js";
import { CardService } from "./CardService.js";


const {replace, includes, map, forEach, concat} = lodash;
const { Client, Events, ActionRowBuilder, MessageButtonStyle, ButtonBuilder, GatewayIntentBits, ButtonStyle } = discord;

const TOGGLE_DECK_CODE_CUSTOM_ID = "deckCodeToggle";
const SHOW_DECK_CODE_LABEL = "Show deck code";
const SHOW_DECK_CODE_STYLE = ButtonStyle.Success;
const HIDE_DECK_CODE_LABEL = "Hide deck code";
const HIDE_DECK_CODE_STYLE = ButtonStyle.Danger;

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
    
    const rows = fitButtonsIntoActionBars(buttons, baseButton);

    return rows;
}

function buildActionBarsFromDeck(deck) {
    if(deck.length !== 12) {
        return;
    }

    const buttons = map(deck, (card) => {
        return new ButtonBuilder()
            .setCustomId(card.webp_path)
            .setLabel(card.name)
            .setStyle(ButtonStyle.Secondary)
    });

    const rows = fitButtonsIntoActionBars(buttons);

    const toggleDeckCodeButton = new ButtonBuilder()
        .setCustomId(TOGGLE_DECK_CODE_CUSTOM_ID)
        .setLabel(SHOW_DECK_CODE_LABEL)
        .setStyle(SHOW_DECK_CODE_STYLE);

    const toggleDeckCodeActionRow = new ActionRowBuilder().addComponents([toggleDeckCodeButton]);

    rows[0].components[0].setStyle(ButtonStyle.Primary);

    return concat([toggleDeckCodeActionRow], rows);
}

function fitButtonsIntoActionBars(buttons, firstButton = null) {
    const rows = [];
    let row = !!firstButton ? [firstButton] : [];
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

// collector that responds to button click by displaying its image
function createButtonToggleCollector(msg, rows, replyId, deck=null, contentPrefix="", deckCode="") {
    let selectedButton = !!deckCode ? rows[1].components[0] : rows[0].components[0];
    let showingDeckCode = false;
    let cardImg = !!deck ? fs.readFileSync(selectedButton.data.custom_id) : null;
    let card = !!deck ? deck[0] : null;
    const filter = (i) => {
        // if(replyId !== i.message.id) {
        //     return false;
        // }

        return replyId !== i.message.id;
    }
    const collector = msg.channel.createMessageComponentCollector({filter, time: 300000});

    collector.on('collect', async i => {
        if(i.customId === TOGGLE_DECK_CODE_CUSTOM_ID) {
            showingDeckCode = !showingDeckCode;
            rows[0].components[0]
                .setLabel(!showingDeckCode ? SHOW_DECK_CODE_LABEL : HIDE_DECK_CODE_LABEL)
                .setStyle(!showingDeckCode ? SHOW_DECK_CODE_STYLE : HIDE_DECK_CODE_STYLE);

            if(showingDeckCode) {
                await i.update({ content: `${contentPrefix}${deckCode}`, components: [rows[0]], files: [] });
            } else {
                console.log("right here");
                await i.update({ content: `${contentPrefix}${card.ability}`, components: rows, files: [{ attachment: cardImg }] });
            }
            return;
        }

        const button = findButtonByCustomId(rows, i.customId);
        if(!!button) {
            selectedButton.data.style = ButtonStyle.Secondary;
            button.data.style = ButtonStyle.Primary;
            selectedButton = button;
        }

        cardImg = fs.readFileSync(selectedButton.data.custom_id);
        if(!!deck) {
            const displayName = findButtonByCustomId(rows, i.customId).data.label;
            card = CardService.getCardByDisplayName(displayName, deck);
            
            await i.update({ content: `${contentPrefix}${card.ability}`, components: rows, files: [{ attachment: cardImg }] });
        } else {
            await i.update({ components: rows, files: [{ attachment: cardImg }] });
        }
    });

    collector.on('end', () => console.log("Collecter ended"));
}

function parseDeckCodeIntoDeck(content) {
    try {
        console.log("parsing deck");

        const cards = map(content.split("\n").slice(0, 12), (card) => {
            const name = card.split(" ").slice(2).join("").toLowerCase();
            return CardService.getCardByName(name);
        });

        return cards;
    } catch(error) {
        return [];
    }
}

function getCodeFromDeckCode(content) {
    return content.split("#")[13].replace(/\n/g, "");
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
            msg.reply("What is lil bro talking about?");
            return;
        }

        const cardImg = fs.readFileSync(card.webp_path);

        const rows = buildVariantActionBarsFromCard(card);

        const reply = await msg.reply({ content: card.ability, components: rows, files: [{ attachment: cardImg }] });
        
        createButtonToggleCollector(msg, rows, reply.id);
    }

    const deckCodeRegex = /^# \(/i;
    if(deckCodeRegex.test(content)) {
        await msg.delete();

        const deck = parseDeckCodeIntoDeck(content);

        const code = getCodeFromDeckCode(content);

        const cardImg = fs.readFileSync(deck[0].webp_path);

        const rows = buildActionBarsFromDeck(deck);
 
        const prefix = `Deck from <@${msg.author.id}>:\n\n`;

        const botMessage = await msg.channel.send({ content: `${prefix}${deck[0].ability}`, components: rows, files: [{ attachment: cardImg }] });

        createButtonToggleCollector(msg, rows, botMessage.id, deck, prefix, code);
    }

});


const botLogin = secrets.botLogin;
bot.login(botLogin);
