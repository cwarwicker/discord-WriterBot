const Commando = require('discord.js-commando');
const path = require('path');
const sql = require('sqlite');
const settings = require('./settings.json');

const bot = new Commando.Client({
    owner: '291154723631792129',
    commandPrefix: '!',
    disableEveryone: true,
    unknownCommandResponse: false
});

bot.registry
    .registerDefaultTypes()
    .registerGroups([
        ['writing', 'Writing-related commands'],
        ['fun', 'Fun commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));
       
bot.setProvider(
    sql.open(path.join(__dirname, '/data/settings.sqlite')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);


bot.on('ready', () => {
    console.log('I am ready to serve');    
});

bot.on('exit', () => {
    console.log('I am gone');    
});

bot.on('reconnecting', () => {
    console.log('I am coming back');    
});

bot.on('error', console.error);

bot.login(settings.token);