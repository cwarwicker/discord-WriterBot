const Commando = require('discord.js-commando');
const path = require('path');
const sql = require('sqlite');
const Database = require('./structures/db.js');
const cron = require('node-cron');
const Goal = require('./structures/goal.js');
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
        ['fun', 'Fun commands'],
        ['util', 'Utility commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));
       
bot.on('ready', () => { 
    
    // Initialise database
    const db = new Database();
    db.init();
       
    // Start crons
    //
    // Midnight every night
    cron.schedule('0 0 * * *', function(){
        console.log('[CRON] Resetting user goals');
        var goal = new Goal();
        goal.reset();
    });
        
    console.log(`[READY] Logged in as ${bot.user.tag} (${bot.user.id})`);        
    
});

bot.on('disconnect', (event) => { console.error(`[DISCONNECT] Disconnected with code (${event.code})`); });
bot.on('reconnecting', () => { console.log('[RECONNECT] I am coming back online');});
bot.on('commandRun', (command) => console.log(`[COMMAND] Ran command ${command.groupID}:${command.name}`));
bot.on('error', err => console.error('[ERROR]', err));
bot.on('warn', err => console.warn('[WARNING]', err));
bot.on('commandError', (command, err) => console.error('[COMMAND ERROR]', command.name, err));

bot.setProvider(
    sql.open(path.join(__dirname, '/data/db/settings.db')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);

bot.login(settings.token);