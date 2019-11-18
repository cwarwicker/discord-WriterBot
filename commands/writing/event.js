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
            description: 'Using these commands, you can create your own server writing events (like NaNoWriMo) and compete against each other to see who can write the most.\nOnly one event can run on a server at a time.',
            examples: [
                '`event create My Event Title` Create an event called "My Event Title" | Permissions required: [MANAGE_MESSAGES]',
                '`event rename My New Event Title` Rename event to "My New Event Title" | Permissions required: [MANAGE_MESSAGES]',
                '`event description This is the description` Set the description of the event to "This is the description" | Permissions required: [MANAGE_MESSAGES]',
                '`event image https://i.imgur.com/tJtAdNs.png` Set the thumbnail image for the event to the image URL specified | Permissions required: [MANAGE_MESSAGES]',
                '`event delete` Deletes the current event | Permissions required: [MANAGE_MESSAGES]',
                '`event schedule` Starts the event scheduling wizard. Please pay attention to the date/time formats, they must be entered exactly as the bot expects | Permissions required: [MANAGE_MESSAGES]',
                '`event start` Manually starts the current event | Permissions required: [MANAGE_MESSAGES]',
                '`event end` Manually ends the current event | Permissions required: [MANAGE_MESSAGES]',
                '`event time` Checks how long until the event ends or starts',
                '`event update 500` Updates your event word count to 500 total words',
                '`event me` Checks your current event word count',
                '`event top` Checks the word count leaderboard for the current event'
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
        if (action.length === 0 || action === 'info'){
            return this.run_info(msg);
        }
        
        // Create an event
        else if (action === 'create'){
            return this.run_create(msg, arg1);
        }
        
        else if(action === 'rename'){
            return this.run_rename(msg, arg1);
        }
        
        // Set description
        else if(action === 'description' || action === 'desc'){
            return this.run_set(msg, 'description', arg1);
        }
        
        // Set img
        else if(action === 'image' || action === 'img'){
            return this.run_set(msg, 'img', arg1);
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
        else if(action === 'end' || action === 'stop'){
            return this.run_end(msg);
        }
        
        // Check how much time left
        else if(action === 'left' || action === 'time'){
            return this.run_left(msg);
        }
        
        // Schedule the event
        else if(action === 'schedule'){
            return this.run_schedule(msg);
        }
        
        // Update your event progress made outside of the bot
        else if(action === 'update'){
            return this.run_update(msg, arg1);
        }
        
        // View your own progress in an event
        else if(action === 'me'){
            return this.run_me(msg);
        }
        
        // View the leaderboard for the event
        else if(action === 'leaderboard' || action === 'leaders' || action === 'top'){
            return this.run_leaderboard(msg);
        }
        
        // View the top leaderboard of historical events
        else if(action === 'history'){
            // TODO
        }
        
        else
        {
            return msg.say( lib.get_string(msg.guild.id, 'err:what?') );
        }
                        
    }
    
    get_leaderboard(msg, mention, limit){
        
        let guildID = msg.guild.id;
        
        var event = new Event(guildID, true);
        
        // If the event has ended, show entire leaderboard with no limit
        if (!event.is_running()){
            limit = undefined;
        }
        
        var users = event.getUsers(limit);
               
        // No users, don't bother
        if (users.length === 0){
            return false;
        }
        
        var fieldArray = [];
        var desc = lib.get_string(guildID, 'event:leaderboard:desc');
        var footer = util.format( lib.get_string(guildID, 'event:leaderboard:footer'), limit );
        
        // If no limit, don't show the limit in the string or the footer
        if (limit === undefined){
            limit = '';
            footer = '';
        }
        
        // If the event has ended, don't show the footer, and take out the "so far" of the description.
        if (!event.is_running()){
            desc = lib.get_string(guildID, 'event:leaderboard:desc:ended');
            footer = '';
        }
        
        // Headers
        fieldArray.push({
            name: '\u200b',
            value: '**'+lib.get_string(guildID, 'user')+'**',
            inline: true
        });

        // Word count
        fieldArray.push({
            name: '\u200b',
            value: '**'+lib.get_string(guildID, 'wordcount')+'**',
            inline: true
        });
                
        var userField = '';
        var wordsField = '';
        
        // Now loop through the users
        for (var i = 0; i < users.length; i++){
            
            var user = users[i];
            var pos = i+1;
                                    
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
                        
            // If username is too long, don't show it all
            if (username.length > 20){
                username = username.slice(0, 20) + '..';
            }
            
            userField += pos + '. ' + username;
            userField += '\n';
            
            wordsField += user.words;
            wordsField += '\n';
                        
        }
        
        fieldArray.push({
            name: '\u200b',
            value: userField,
            inline: true
        });

        // Word count
        fieldArray.push({
            name: '\u200b',
            value: wordsField,
            inline: true
        });
        
                
        // Data for the embedded message        
        var embed = {
            color: 0xb300b3,
            title: event.getTitle().toUpperCase() + ' - ' + lib.get_string(guildID, 'event:leaderboard'),
            description: util.format( desc, limit + ' ', event.getTitle() ),
            thumbnail: {
                url: 'https://i.imgur.com/tJtAdNs.png'
            },
            fields: fieldArray,
            footer: {
                text: footer,
                icon_url: 'https://i.imgur.com/tJtAdNs.png'
            }
        };
        
        return embed;
        
    }
    
    run_left(msg){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var now = Math.floor(new Date() / 1000);
        var event = new Event(guildID);
        
        // Is it scheduled to start but not yet started? ANd it actually has a scheduled start date... If so - get how long until it starts
        if (event.any() && !event.is_running()){
            var start = event.getStartTime();
            if (start > 0){
                return msg.say(msg.author + ', ' + util.format( lib.get_string(guildID, 'event:timetostart'), lib.convert_time_left_hr(now, start) ) );
            }
        }
        
        // Otherwise:
        
        // Is there already a current event?
        if (!event.is_running()){
            return msg.say( lib.get_string(msg.guild.id, 'event:notrunning') );
        }
        
        var end = event.getEndTime();

        if (end <= 0){
            return msg.say(msg.author + ', ' + lib.get_string(guildID, 'event:noendtime'));
        } else {
            return msg.say(msg.author + ', ' + util.format( lib.get_string(guildID, 'event:timeleft'), lib.convert_time_left_hr(now, end) ) );
        }
        
    }
    
    run_leaderboard(msg){
        var content = this.get_leaderboard(msg, false, 20);
        if (content !== false){
            return msg.embed( content );
        } else {
            return msg.say( lib.get_string(msg.guild.id, 'event:noleaderboard') );
        }
    }
        
        
    run_set(msg, type, value){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var event = new Event(guildID);
        var types = ['description', 'img'];
        
        if (!event.exists()){
            return msg.say( lib.get_string(msg.guild.id, 'event:noexists') );
        }
        
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Must be valid type
        if (types.indexOf(type) < 0){
            return msg.say( lib.get_string(guildID, 'err:what?') );
        }
        
        event.set(type, value);
        return msg.say( msg.author + ', ' + util.format( lib.get_string(guildID, 'event:set'), type, value ) );
        
        
    }    
    
    run_info(msg){
                
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var event = new Event(guildID);
        if (!event.exists()){
            return msg.say( lib.get_string(msg.guild.id, 'event:noexists') );
        }
        
        var startDate = 'N/A';
        var endDate = 'N/A';
        var tz = 'UTC';
        
        var userSetting = new UserSetting();
        var userTz = userSetting.get(userID, 'timezone');
        if (userTz){
            tz = userTz.value;
        }

        if (event.event.startdate > 0){
            startDate = moment.unix(event.event.startdate).tz(tz).format("ddd Do MMM YYYY, HH:mm") + "\n("+tz+")";
        }
        
        if (event.event.enddate > 0){
            endDate = moment.unix(event.event.enddate).tz(tz).format("ddd Do MMM YYYY, HH:mm") + "\n("+tz+")";
        }
        
        // Has it already started?
        var desc = '';
        if (event.is_running()){
            desc = lib.get_string(guildID, 'event:started');
        } else {
            desc = lib.get_string(guildID, 'event:notyetstarted');
        }
        
        var numWriters = event.getUsers().length;
        var numWords = event.getTotalWordCount();
        
        // Descrioption provided?
        var event_desc = event.getDesc();
        if (event_desc !== false && event_desc !== null && event_desc.trim().length > 0){
            desc = event_desc + '\n\n' + '*'+desc+'*';
        }
        
        // Use the default thumbnail or one provided?
        var thumbnail = 'https://i.imgur.com/tJtAdNs.png';
        var event_img = event.getImg();
        if (event_img !== false && event_img !== null && event_img.trim().length > 0){
            thumbnail = event_img;
        }
        
        // Display info in an embedded message, to make it look nicer
        return msg.embed({
            color: 0xb300b3,
            title: event.getTitle().toUpperCase(),
            description: desc,
            thumbnail: {
                url: thumbnail
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
                    name: '\u200b',
                    value: '\u200b'
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
    
    run_me(msg){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var event = new Event(guildID);
        
        // Is there actually an current event to delete?
        if (!event.any()){
            return msg.say( lib.get_string(msg.guild.id, 'event:noexists') );
        }
        
        var yourWords = event.getUserWordCount(userID);
        return msg.say( msg.author + ', ' + util.format( lib.get_string(guildID, 'event:wordcount'), event.getTitle(), yourWords ) );
        
    }
    
    // Create an event
    run_create(msg, title){
        
        let guildID = msg.guild.id;
        let channelID = msg.message.channel.id;

        var event = new Event(guildID);
        title = title.trim();
                
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Is there already a current event?
        if (event.any()){
            return msg.say( lib.get_string(msg.guild.id, 'event:already') );
        }
        
        // Make sure shortnbame and title are set
        if (title.length < 1){
            return msg.reply(lib.get_string(msg.guild.id, 'event:title'));
        }
        
        // Create the event
        event.create( title, channelID );
        return msg.say( msg.author + ', ' + util.format( lib.get_string(msg.guild.id, 'event:created'), title ) );

    }
    
    run_rename(msg, title){
        
        let guildID = msg.guild.id;
        let channelID = msg.message.channel.id;

        var event = new Event(guildID);
        title = title.trim();
                
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Make sure the event exists
        if (!event.any()){
            return msg.say( lib.get_string(msg.guild.id, 'event:noexists') );
        }
        
        // Make sure shortnbame and title are set
        if (title.length < 1){
            return msg.reply(lib.get_string(msg.guild.id, 'event:rename:title'));
        }
        
        // Create the event
        event.rename( title, channelID );
        return msg.say( msg.author + ', ' + util.format( lib.get_string(msg.guild.id, 'event:renamed'), title ) );
        
        
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
        
        var output = util.format( lib.get_string(msg.guild.id, 'event:begin'), event.getTitle() );
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
        
        // Is there actually an event created?
        if (!event.any()){
            return msg.say( lib.get_string(msg.guild.id, 'event:noexists') );
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