const { Command } = require('discord.js-commando');
const util = require('util');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const lib = require('./../../lib.js');
const Event = require('./../../structures/event.js');
const UserSetting = require('./../../structures/user_settings.js');


module.exports = class EventCommand extends Command {
    
    constructor(client) {
        
        super(client, {
            name: 'event',
            aliases: [],
            group: 'writing',
            memberName: 'event',
            guildOnly: true,
            description: 'Using these commands, you can create your own server writing events (like NaNoWriMo) and compete against each other to see who can write the most',
            examples: [
                
            ],
            args: [
                {
                    key: "action",
                    prompt: "",
                    default: "",
                    type: "string"
                },
                {
                    key: "arg1",
                    default: "",
                    prompt: "",    
                    type: "string"    
                }
            ]
        });
        
        this.waiting = [];
                
    }

    async run(msg, {action, arg1}) {
        
        // Add guild to waiting array if not already set
        var key = lib.findObjectArrayKeyByKey(this.waiting, 'guild', msg.guild.id);
        if (key === null){
            this.waiting.push({guild: msg.guild.id, users: []});
            key = lib.findObjectArrayKeyByKey(this.waiting, 'guild', msg.guild.id);
        }
                
        // Just display the name and info
        if (action.length === 0){
            return this.run_info(msg);
        }
        
        // Create an event
        else if (action === 'create'){
            return this.run_create(msg, arg1);
        }
        
        // Delete an event
        else if(action === 'delete'){
            return this.run_delete(msg);
        }
        
        // Start an event
        else if(action === 'start'){
            return this.run_start(msg);
        }
        
        // End an event
        else if(action === 'end'){
            return this.run_end(msg);
        }
        
        else if(action === 'schedule'){
            return this.run_schedule(msg);
        }
                
        
        // Update your event progress made outside of the bot
        else if(action === 'update'){
            return this.run_update(msg, arg1);
        }
        
        // View your own progress in an event
        else if(action === 'me'){
            
        }
        
        // View the leaderboard for the event
        else if(action === 'leaderboard'){
            
        }
        
        // View the top leaderboard of historical events
        else if(action === 'history'){
            
        }
        
        // Also todo: 
        // sprint - if an event is active, automatically add wordcount to it
        // wrote - if an event is active, automatically add wordcount to it
        
        
        
    }
    
    get_leaderboard(msg, mention){
        
        var event = new Event(msg.guild.id);
        var users = event.getUsers();
        var output = '';
        
        for (var i = 0; i < users.length; i++){
            
            var user = users[i];
            var pos = i+1;
            output += pos + '. ';
            
            // Last known username
            var username = user.username;
            
            // If they are still a member, get their name properly
            var member = lib.getMember(msg, user.id);
            if (member){
                if (mention === true){
                    username = `<@${member.id}>`;
                } else {
                    username = member.user.username;
                }
            }
            
            output += username;
            
            // Word count
            output += '          **'+user.words+' Words**';
            
        }
        
        return output;
        
    }
    
    run_info(msg){
                
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var event = new Event(guildID);
        if (!event.exists()){
            return msg.say( lib.get_string(msg.guild.id, 'event:noexists') );
        }
        
        var leaderboard = 'test';
        var startDate = 'N/A';
        var endDate = 'N/A';
        var tz = 'UTC';
        
        var userSetting = new UserSetting();
        var userTz = userSetting.get(userID, 'timezone');
        if (userTz){
            tz = userTz.value;
        }

        if (event.event.startdate > 0){
            startDate = moment.unix(event.event.startdate).tz(tz).format("ddd Do MMM YYYY, HH:mm") + " ("+tz+")";
        }
        
        if (event.event.enddate > 0){
            endDate = moment.unix(event.event.enddate).tz(tz).format("ddd Do MMM YYYY, HH:mm") + " ("+tz+")";
        }
        
        var numWriters = '-';
        var numWords = '-';
                
        return msg.embed({
                    color: 0xb300b3,
                    title: event.getTitle().toUpperCase(),
                    author: {
                        name: this.client.user.username,
                        icon_url: this.client.user.avatarURL
                    },
                    fields: [
                        {
                            name: "Start Date",
                            value: startDate
                        },
                        {
                            name: "End Date",
                            value: endDate
                        },
                        {
                            name: "Writers",
                            value: numWriters,
                            inline: true
                        },
                        {
                            name: "Words Written",
                            value: numWords,
                            inline: true
                        }
                    ]
            });
        
        
    }
    
    // Create an event
    run_create(msg, title){
        
        let guildID = msg.guild.id;
        let channelID = msg.message.channel.id;

        var event = new Event(guildID);
        title = title.trim();
        
        // Make sure shortnbame and title are set
        if (title.length < 1){
            return msg.reply(lib.get_string(msg.guild.id, 'event:title'));
        }
        
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Is there already a current event?
        if (event.any()){
            return msg.say( lib.get_string(msg.guild.id, 'event:already') );
        }
        
        // Create the event
        event.create( title, channelID );
        return msg.say( msg.author + ', ' + util.format( lib.get_string(msg.guild.id, 'event:created'), title ) );

    }
    
    run_delete(msg){
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
        
        var event = new Event(guildID);
        
        // Are we currently waiting for a yes/no response?
        var key = lib.findObjectArrayKeyByKey(this.waiting, 'guild', guildID);
        var uKey = this.waiting[key].users.indexOf(userID);

        var wait = this.waiting[key].users[uKey];
        if (wait >= 0){
            msg.say(lib.get_string(msg.guild.id, 'event:plsrespond'));
            return null;
        }

        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Is there actually an current event to delete?
        if (!event.any()){
            return msg.say( lib.get_string(msg.guild.id, 'event:noexists') );
        }
        
        // Are you sure you want to delete it?
        msg.say(lib.get_string(msg.guild.id, 'event:deletesure'));
        
        // Push them into waiting array
        this.waiting[key].users.push(userID);
        
        // Wait for yes/no answer
        msg.channel.awaitMessages( m => ( (m.author.id == userID) && (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'no') ), {
            max: 1,
            time: 30000,
            errors: ['time']
        } ).then(mg => {

            var answer = mg.first().content;
            if (answer.toLowerCase() === 'yes'){

                // Delete it
                event.delete();
                msg.say( util.format( lib.get_string(msg.guild.id, 'event:deleted'), event.getTitle() ) );

            } else {
                msg.say(`OK`);
            }

            // Remove waiting
            this.waiting[key].users = this.waiting[key].users.filter(function(e){ (e !== userID) });
            return null;

        }).catch((err) => {
            // Remove waiting
            this.waiting[key].users = this.waiting[key].users.filter(function(e){ (e !== userID) });
            return null;
        });
                
    }
    
    run_start(msg){
        
        let guildID = msg.guild.id;
        
        var event = new Event(guildID);
        
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Is there already a current event?
        if (!event.any() || event.is_running()){
            return msg.say( lib.get_string(msg.guild.id, 'event:cannotstart') );
        }
        
        // Create the event
        event.start();
        
        var output = util.format( lib.get_string(msg.guild.id, 'event:started'), event.getTitle() );
        return msg.say( output );
        
    }
    
    run_end(msg){
        
        let guildID = msg.guild.id;
        
        var event = new Event(guildID);
        
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Is there already a current event?
        if (!event.is_running()){
            return msg.say( lib.get_string(msg.guild.id, 'event:notrunning') );
        }
        
        // Create the event
        event.end();
        
        var output = util.format( lib.get_string(msg.guild.id, 'event:ended'), event.getTitle() );
        
        // Leaderboard
        // TODO
        
        return msg.say( output );
        
    }
    
    // Schedule it to start and end automatically
    async run_schedule(msg){
                
        var guildID = msg.guild.id;
        var userID = msg.author.id;
        var channelID = msg.message.channel.id;

        var event = new Event(guildID);
        
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( msg.author + ', ' + lib.get_string(guildID, 'event:permissions') );
        }
        
        // Is there already a current event?
        if (event.is_running()){
            return msg.say( msg.author + ', ' + lib.get_string(guildID, 'event:alreadyrunning') );
        }
        
        // Have they set their time difference?
        var userSetting = new UserSetting();
        var tz = userSetting.get(userID, 'timezone');
        if (tz === false){
            return msg.say( msg.author + ', ' + lib.get_string(guildID, 'event:timezonenotset') );
        }
                
        var userTime = momentTimezone.tz(tz.value);
        var offset = userTime.utcOffset();
        var offsetString = ((offset < 0) ? '' : '+') + offset;
                                      
        // Check their timezone is correct
        msg.say( util.format( msg.author + ', ' + lib.get_string(guildID, 'event:preschedule'), tz.value, userTime.format('LLLL'), offsetString ) );
        
        const questions = [];
        var answers = [];
        
        // Create the question and answer arrays
        for (var i = 1; i <= 5; i++){
            questions.push( lib.get_string(guildID, 'event:schedule:question:'+i) );
        }
        
        var waitTime = 60;
                
        
        // Now ask the questions
        for (var i = 0; i < questions.length; i++){
            
            try {
                
                var err = false;
                
                // Ask the question
                var question = questions[i];
                if (i === 4){
                    question = util.format(question, answers[0], answers[1], answers[2], answers[3]);
                }
                
                await msg.say(question);
                
                // Await the response
                const response = await msg.channel.awaitMessages( m => ( (m.author.id == userID) ), {
                    max: 1,
                    time: (waitTime * 1000),
                    errors: ['time']
                } );
                
                let answer = response.first().content.toLowerCase();
                
                // Cancel or exist
                if (answer === 'exit' || answer === 'quit' || answer === 'cancel'){
                    return msg.say('OK');
                }
                
                // Check validity
                // Date
                if (i === 0 || i === 2){
                    
                    // Check date format is valid
                    if (!lib.is_valid_date(answer, 'DD-MM-YYYY')){
                        err = true;
                        i--; // Redo question
                        msg.say( lib.get_string(guildID, 'event:schedule:invaliddate') );
                    }
                    
                } 
                
                // Time
                else if(i === 1 || i === 3){
                    
                    // Check time format is valid
                    if (!lib.is_valid_time(answer)){
                        err = true;
                        i--; // Redo question
                        msg.say( lib.get_string(guildID, 'event:schedule:invalidtime') );
                    }
                                        
                }
                
                // Confirm
                else if(i === 4){

                    // Not correct, so start again
                    if (answer === 'no'){
                        err = true;
                        answers = [];
                        i = -1;
                    }
                    
                }
                
                // If evrything is okay
                if (!err){
                    answers.push(response.first().content);
                }
                
            } catch(error){
                return msg.say( util.format( lib.get_string(guildID, 'err:replytime'), waitTime ) );
            }
            
        }
        
        // Everything is okay, so continue
        // Not going to bother checking that dates and times work, if they get it wrong, they get it wrong
        if (answers.length === questions.length){
            
            var startUnix = lib.convert_date_time_to_unix(answers[0], answers[1], offset);
            var endUnix = lib.convert_date_time_to_unix(answers[2], answers[3], offset);
            
            event.schedule(startUnix, endUnix, channelID);
            return msg.say( msg.author + ', ' + util.format( lib.get_string(guildID, 'event:scheduled'), event.getTitle(), answers[0], answers[1], answers[2], answers[3] ) );
            
        } else {
            return msg.say( msg.author + ', ' + lib.get_string(guildID, 'err:unknown') );
        }
        
        
        
        
        return null;
        
    }
        
    run_update(msg, wordcount){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var event = new Event(guildID);
        
        // Must be numeric
        if (!lib.isNumeric(wordcount)){
            return msg.say(lib.get_string(msg.guild.id, 'err:validamount'));
        }

        // Is there already a current event?
        if (!event.is_running()){
            return msg.say( lib.get_string(msg.guild.id, 'event:notrunning') );
        }
        
        // Update your wordcount for the event
        event.update(msg.author, wordcount);
        return msg.say( `${msg.author} ${util.format(lib.get_string(msg.guild.id, 'event:updated'), event.getTitle())} ${wordcount}` );
        
    }
    
    
};