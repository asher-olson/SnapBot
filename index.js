import * as Discord from "discord.js";
import { MongoClient } from "mongodb";
import * as fs from "fs";

const secrets = JSON.parse(fs.readFileSync('secrets.json'));
const uri = `mongodb+srv://${secrets.mongoUser}:${secrets.mongoPass}@cluster0.mn0nlma.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);



const botLogin = secrets.botLogin;
bot.login(botLogin);