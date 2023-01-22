import * as fs from "fs";
import lodash from 'lodash';
const {find, includes} = lodash;


export class CardService {
    static cards;

    static readCardsJSON() {
        console.log("Reading cards JSON");
        CardService.cards = JSON.parse(fs.readFileSync('cards.json'));
    }

    static getCardByName(name) {
        const card = CardService.cards[name];
        if(!!card) {
            return card;
        }
        
        // if card name not exact, return first card that contains name
        return find(CardService.cards, (c) => includes(c.name, name.toLowerCase()));
    }
}
