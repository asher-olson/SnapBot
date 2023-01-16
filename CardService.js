import * as fs from "fs";
import lodash from 'lodash';
const {find, includes} = lodash;


export class CardService {
    cards;

    constructor() {
        this.cards = JSON.parse(fs.readFileSync('cards.json'));
        // console.log(this.cards);
    }

    getCardByName(name) {
        const card = this.cards[name];
        if(!!card) {
            return card;
        }
        
        return find(this.cards, (c) => includes(c.name, name.toLowerCase()));
    }
}
