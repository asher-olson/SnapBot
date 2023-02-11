import * as fs from "fs";
import lodash from 'lodash';
const {find, includes} = lodash;


export class CardService {
    static cards;

    static readCardsJSON() {
        console.log("Reading cards JSON");
        CardService.cards = JSON.parse(fs.readFileSync('cards.json'));
    }

    static getCardByName(name, set=CardService.cards) {
        const card = set[name];
        if(!!card) {
            return card;
        }

        if(name === "") {
            return null;
        }
        
        // if card name not exact, return first card that contains name
        return find(set, (c) => includes(c.id, name.replace("-", "").toLowerCase()));
    }

    static getCardByDisplayName(displayName, set=CardService.cards) {
        const card = find(set, (c) => {
            return c.name === displayName;
        });
        if(!!card) {
            return card;
        }

        return find(set, (c) => {
            const variant = find(c.variant_paths, (v) => v.name === displayName);
            return !!variant;
        });
    }
}
