const Commando = require('discord.js-commando');
const path = require('path');
const sql = require('sqlite');
const Database = require('./structures/db.js');
const cron = require('node-cron');
const Goal = require('./structures/goal.js');
const moment = require('moment');

const settings = require('./settings.json');
const version = require('./version.json');
const Update = require('./data/install/update.js');
const event = require('./structures/event.js');


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
    
    // Run any updates
    var update = new Update();
    update.run(version.dbversion);
    
    let checkEvents = function(){
        console.log('[CRON]['+moment().format("DD-MM-YYYY, HH:mm")+'] Checking events');
        event.find_events_to_start(bot);
        event.find_events_to_end(bot);
    };
    
    // Check events on boot, incase we went down
    checkEvents();
    
    // TODO: Restart any sprint timers, if we can
    
    
       
    // Start crons
    //
    // Midnight every night
    cron.schedule('0 0 * * *', function(){
        console.log('[CRON]['+moment().format("DD-MM-YYYY, HH:mm")+'] Resetting user goals');
        var goal = new Goal();
        goal.reset();
    });
    
    // Every 10 minutes, check for events to start and end
    cron.schedule('*/10 * * * *', checkEvents);

        
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


