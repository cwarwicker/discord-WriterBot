const { Command } = require('discord.js-commando');
const Data = require('./../../structures/data.js');
const lib = require('./../../lib.js');
const XP = require('./../../structures/xp.js');

/**
 * sprint start - Starts one with default settings (20 min length, starting in 2 mins) - DONE
 * sprint for n in n - Schedules a (n) minute sprint to start in (n) minutes - DONE
 * sprint join n - Joins the current sprint, with a starting wordcount of (n) - DONE
 * sprint leave - Leaves the current sprint - DONE
 * sprint time - Checks how long until sprint starts, or finishes - DONE
 * sprint cancel - Cancels a pending sprint- DONE
 * sprint wc n - Declares your finishing wordcount - DONE
 * sprint users - Lists the users taking part - DONE
 */

module.exports = class SprintCommand extends Command {
        
    constructor(client) {
                
        super(client, {
            name: 'sprint',
            aliases: [],
            group: 'writing',
            memberName: 'sprint',
            description: 'Write with your friends and see who can write the most in the time limit!',
            examples: ['`sprint start` Quickstart a sprint with the default settings'],
            args: [
                {
                    key: 'opt1',
                    prompt: '',
                    default : '',
                    type: 'string'
                },
                {
                    key: 'opt2',
                    prompt: '',
                    default : '',
                    type: 'string'
                },
                {
                    key: 'opt3',
                    prompt: '',
                    default : '',
                    type: 'string'
                },
                {
                    key: 'opt4',
                    prompt: '',
                    default : '',
                    type: 'string'
                }
            ]
        });
        
        this.defaults = {
            length: 20,
            delay: 2,
            post_delay: 120
        };
        
        this.max = {
            length: 60
        };
        
        this.guildSettings = [];
        this.messageTimeout = null;
                
    }

    async run(msg, {opt1, opt2, opt3, opt4}) {
                                                                
        this.data = new Data(msg.guild);
        this.guildSettings = this.data.g();
        
        // Create sprint object, if there isn't one
        if (this.guildSettings.sprint === undefined){
            this.guildSettings.sprint = {};
        }  
        
        // Create records array, if there isn't one
        if (this.guildSettings.records === undefined){
            this.guildSettings.records = [];
        }
                        
        // Start a sprint
        if (opt1 === 'start'){
            this.run_start(msg);
        }
        
        else if (opt1 === 'for'){
            if (opt3 === 'now'){
                opt4 = 0;
            }
            this.run_start(msg, opt2, opt4);
        }
        
        // Cancel the sprint
        else if (opt1 === 'cancel' || opt1 === 'stop'){
            this.run_cancel(msg);
        }
        
        // Check time remaining
        else if (opt1 === 'time' || opt1 === 'tc'){
            this.run_time(msg);
        }
        
        // Join the sprint
        else if (opt1 === 'join'){
            this.run_join(msg, opt2);
        }
        
        else if (opt1 === 'leave'){
            this.run_leave(msg);
        }
        
        else if (opt1 === 'users'){
            this.run_users(msg);
        }
        
        else if (opt1 === 'wc' || opt1 === 'declare'){
            this.run_declare(msg, opt2);
        }
        
        else if (opt1 === 'end'){
            this.run_end(msg);
        }
        
        else if (opt1 === 'help'){
            this.run_help(msg);
        }
        
        else if (opt1 === 'pb' || opt1 === 'record'){
            this.run_pb(msg);
        }
        
    }
    
    is_sprinting(){
        return (Object.keys(this.guildSettings.sprint).length > 0);
    }
    
    is_user_sprinting(usr){
        
        // Check if you are already in the sprint
        var userArray = this.guildSettings.sprint.users;

        var index = userArray.findIndex(function(i){
            return (i.user == usr.id);
        });
        
        return (index >= 0);
        
    }
    
    is_sprint_finished(){
        
        var now = Math.floor(new Date() / 1000);
        var sprint = this.guildSettings.sprint;
        
        
        return (now > sprint.end);
        
    }
    
    is_declaration_finished(){
        
        var sprint = this.guildSettings.sprint;
        var userArray = sprint.users;
        var declared = 0;

        for (var i = 0; i < userArray.length; i++){
            var usr = userArray[i];
            if (usr.e_wc > 0){
                declared++;
            }

        }
        
        return (declared === userArray.length);
        
    }
    
    run_help(msg){
       
        var output = `
**Sprint Info**
Write with your friends and see who can write the most in the time limit!                        
                        
**Sprint Default Settings**
\`length\` ${this.defaults.length} minutes
\`delay\` ${this.defaults.delay} minute
                        
**Sprint Commands**
\`sprint start\` Quick-start a sprint with the default settings
\`sprint for 30 in 5\` Sprint for 30 minutes, starting in 5 minutes 
\`sprint for 30 now\` Sprint for 30 minutes, starting immediately
\`sprint join\` Join the current sprint
\`sprint join 1000\` Join the current sprint, with a starting wordcount of 1000 (written before the sprint started)
\`sprint leave\` Leave the current sprint
\`sprint time\` Check how long is remaining
\`sprint users\` Display a list of the users taking part in the sprint
\`sprint cancel\` Cancel the current sprint for all users (you must be the sprint creator or a server moderator to do this)
\`sprint wc 2000\` Declare your finished word count is 2000 words (total written by the end of the sprint)
\`sprint pb\` Shows you your Personal Best words-per-minute from sprints done on this server                        
                        
**Sprint Tips**
If you join the sprint with a starting wordcount, remember to declare your total word count at the end, not just the amount of words you wrote in the sprint.
e.g. if you joined with 1000 words, and during the sprint you wrote another 500 words, your final wordcount you should declare would be 1500
`;
        msg.say(output);
        
    }
    
    run_pb(msg){
        
        var records = this.guildSettings.records;

        // First check if they even have a record
        var index = records.findIndex(function(i){
            return (i.user == msg.author.id && i.record === 'wpm');
        });

        // If they don't have one, create one now
        if (index < 0){
            var userRecord = {user: msg.author.id, record: 'wpm', value: 0};
            records.push(userRecord);
            this.data.s(this.guildSettings);
        } else {
            var userRecord = records[index];
        }
        
        return msg.say(`${msg.author}, your personal best is **${userRecord.value}** words-per-minute`);                                
        
    }
        
    run_declare(msg, amount){
        
        if (this.is_sprinting() && this.is_user_sprinting(msg.author)){
            
            // Is the sprint finished?
            if (!this.is_sprint_finished()){
                msg.say('The sprint hasn\'t finished yet. Please wait and declare your word count at the end.');
                return null;
            }
            
            
            // Check amount is valid
            if (!lib.isNumeric(amount)){
                msg.say('Please enter a valid word count');
                return null;
            }
            
            amount = Math.floor(amount);
            
            // Find user in the list
            var userArray = this.guildSettings.sprint.users;

            var index = userArray.findIndex(function(i){
                return (i.user == msg.author.id);
            });
            
            var user = userArray[index];
            
            // Updated declared word count
            user.e_wc = amount;
            
            var written = user.e_wc - user.s_wc;
            
            // Update settings
            this.guildSettings.sprint.users = userArray;
            this.data.s(this.guildSettings);
            
            msg.say(`${msg.author} word count updated: ${user.e_wc} (${written} new)`);
                        
            // Are all users declared now?
            if (this.is_declaration_finished()){
                this.finish(msg);
            }
                        
        }
        
    }
    
    
    run_users(msg){
        
        if (this.is_sprinting()){
            
            // Check if you are already in the sprint
            var userArray = this.guildSettings.sprint.users;

            var users = [];
            for (var i = 0; i < userArray.length; i++){
                var user = msg.guild.member(userArray[i].user);
                if (user !== null){
                    users.push(user.user.username);
                }
            }

            var output = 'Sprint Participants: ';
            output += users.join(', ');
            msg.say(output);
        
        }
        
    }
    
    run_leave(msg){
        
        if (this.is_sprinting()){
            
            // Check if you are already in the sprint
            var userArray = this.guildSettings.sprint.users;
             
            if (this.is_user_sprinting(msg.author)){
                
                userArray.splice(userArray.findIndex(function(i){
                    return (i.user == msg.author.id);
                }), 1);
                
                // Update settings
                this.guildSettings.sprint.users = userArray;
                this.data.s(this.guildSettings);
                
                msg.say('You have left the sprint.');
                
            } 
            
        }
        
    }
    
    
    run_join(msg, start){
        
        if (this.is_sprinting()){
            
            // Check if you are already in the sprint
            var userArray = this.guildSettings.sprint.users;

            var users = [];
            for (var i = 0; i < userArray.length; i++){
                users.push(userArray[i].user);
            }
            
            if (users.indexOf(msg.author.id) < 0){
                
                if (start < 0 || start === undefined || start === ''){
                    start = 0;
                }
                                
                userArray.push({
                    user: msg.author.id,
                    s_wc: start,
                    e_wc: 0
                });
                
                // Update settings
                this.guildSettings.sprint.users = userArray;
                this.data.s(this.guildSettings);
                
                msg.say('You have joined the sprint, with ' + start + ' words.');
                
            } else {
                msg.say('You have already joined this sprint.');            
            }
            
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`');            
        }
        
    }
    
    
    run_time(msg){
        
        var now = Math.floor(new Date() / 1000);
                
        // Check to make sure there is an active sprint on this guild/server
        if (this.is_sprinting()){
            
           var sprint = this.guildSettings.sprint;
           
           // Has it not started yet?
           if (now < sprint.start){
               var diff = sprint.start - now;
               var left = lib.secsToMins(diff);
               msg.say('Sprint begins in ' + left.m + ' minutes, ' + left.s + ' seconds');
           }
           
           // Or is it currently running?
           else if (now < sprint.end){
               var diff = sprint.end - now;
               var left = lib.secsToMins(diff);
               msg.say(left.m + ' minutes, ' + left.s + ' seconds remaining');
           }
                                    
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`');            
        }
        
    }
    
    run_cancel(msg){
                
        // Check to make sure there is an active sprint on this guild/server
        if (this.is_sprinting()){
                        
            // We can only cancel it if we are the creator of it, or we have the manage messages permission
            if (msg.author.id == this.guildSettings.sprint.createdBy || msg.member.hasPermission('MANAGE_MESSAGES')){
                
                // Get all the users to notify
                var userArray = this.guildSettings.sprint.users;
                                
                var users = [];
                for (var i = 0; i < userArray.length; i++){
                    users.push('<@'+userArray[i].user+'>');
                }
                                
                // Unset the sprint data
                this.guildSettings.sprint = {};
                this.data.s(this.guildSettings);
                
                // Clear the message timeout
                this.clear();
                
                var output = '\:disappointed: **SPRINT CANCELLED**\n\n';
                output += users.join(', ');
                
                msg.say(output);
                
            } else {
                msg.say('You do not have the permission to cancel this sprint.');
            }
                                    
        }
        
    }
    
    
    run_start(msg, sFor, sIn){
                
        var obj = this;
        var now = Math.floor(new Date() / 1000);
          
        // Check if there is a sprint, but it's finished, we can remove it
        if ( this.is_sprinting() && this.guildSettings.sprint.end < now ){
            this.guildSettings.sprint = {};
        }
          
          
        // Check to make sure there is no active sprint on this guild/server
        if (!this.is_sprinting()){
            
            if (!lib.isNumeric(sFor) || sFor < 0 || sFor > this.max.length){
                sFor = this.defaults.length;
            }
            
            if (!lib.isNumeric(sIn) || sIn < 0){
                sIn = this.defaults.delay;
            }
            
            sFor = Math.ceil(sFor);
            sIn = Math.ceil(sIn);
                        
            var start = now + (sIn * 60);
            var end = start + (sFor * 60);
            var delay = (start - now) * 1000;
                        
            // Update the guild settings
            this.guildSettings.sprint = {
                start: start,
                end: end,
                created: now,
                createdBy: msg.author.id,
                users: [{
                    user: msg.author.id,
                    s_wc: 0,
                    e_wc: 0
                }]
            };
            
            this.data.s(this.guildSettings);
            
            // If we are starting immediately, display that message instead of the standard one
            if (delay === 0){
                this.post_start_message(msg);
            } else {
            
                var left = lib.secsToMins( (delay / 1000) );

                var output = '\:alarm_clock:  **STARTING SPRINT**\n\nThe next sprint starts in ' + left.m + ' minute(s) and will run for ' + sFor + ' minute(s). `sprint join` to join this sprint.\n';
                output += `${msg.author}`;

                msg.say(output);

                // Set timeout to alert users when it starts
                this.messageTimeout = setTimeout(function(){
                    obj.post_start_message(msg);
                }, delay);
            
            }
            
        } else {
            msg.say('There is already a sprint running on this server. Please wait until it has finished before creating a new one.');
        }
                
    }
    
    post_start_message(msg){
        
        var obj = this;
        
        // Check to make sure there is an active sprint on this guild/server
        if (this.is_sprinting()){
                            
            var sprint = this.guildSettings.sprint;
            
            // Get all the users to notify
            var userArray = sprint.users;

            var users = [];
            for (var i = 0; i < userArray.length; i++){
                users.push('<@'+userArray[i].user+'>');
            }

            var diff = sprint.end - sprint.start;
            var left = lib.secsToMins(diff);
            
            // Clear the message timeout
            this.clear();
            
            // Set the new timeout for the ending message
            var delay = diff * 1000;
            this.messageTimeout = setTimeout(function(){
                obj.post_end_message(msg);
            }, delay);
            
            // Post the starting message
            var output = '\:writing_hand: **THE SPRINT BEGINS**\n\nGet writing, you have ' + left.m + ' minute(s).\n';
            output += users.join(', ');
            msg.say(output);
                                                    
        }
                
    }
    
    post_end_message(msg){
        
        var obj = this;
        var now = Math.floor(new Date() / 1000);
        var sprint = this.guildSettings.sprint;
        
        // Check to make sure there is an active sprint on this guild/server
        if (this.is_sprinting()){
                            
            // Get all the users to notify
            var userArray = sprint.users;

            var users = [];
            for (var i = 0; i < userArray.length; i++){
                users.push('<@'+userArray[i].user+'>');
            }

            // Clear the message timeout
            this.clear();
            
            // Set the new timeout for the ending message
            var delay = this.defaults.post_delay * 1000;
            this.messageTimeout = setTimeout(function(){
                obj.finish(msg);
            }, delay);
            
            // Post the ending message
            var output = '\:octagonal_sign: **TIME IS UP**\n\nPlease submit your word count. e.g. `sprint wc 320`. You have ' + Math.round(this.defaults.post_delay / 60) + ' minutes.\n';
            output += users.join(', ');
            msg.say(output);
                                                    
        }
        
    }
    
    
    finish(msg){
        
        var obj = this;
        var now = Math.floor(new Date() / 1000);
        var sprint = this.guildSettings.sprint;
        var records = this.guildSettings.records;
        var xp = new XP(msg);
        
        if (this.is_sprinting()){
            
            // Clear the timeout, in case we've finished before the ending timer
            this.clear();
            
            // Calculate positions
            var result = [];
            var userArray = sprint.users;
            
            // Loop through the users and add their wordcount and wpm into the results array
            for (var i = 0; i < userArray.length; i++){
                
                var usr = userArray[i];
                if (usr.e_wc > 0){
                    
                    var count = usr.e_wc - usr.s_wc;
                    var wpm = count / ((sprint.end - sprint.start) / 60);
                    var newWpmRecord = 0;
                    
                    // Check their record to see if they beat it
                    // First check if they even have a record
                    var index = records.findIndex(function(i){
                        return (i.user == usr.user && i.record === 'wpm');
                    });
                    
                    // If they don't have one, create one now
                    if (index < 0){
                        var userRecord = {user: usr.user, record: 'wpm', value: 0};
                        records.push(userRecord);
                    } else {
                        var userRecord = records[index];
                    }
                                        
                    // Compare it to their wpm from this sprint and update if necessary
                    if (wpm > userRecord.value){
                        userRecord.value = wpm;
                        newWpmRecord = 1;
                    }
                    
                    
                    // Add the xp to their user record
                    xp.add(usr.user, xp.XP_COMPLETE_SPRINT);
                    
                    // Push to result dataset
                    result.push({user: usr.user, count: count, wpm: wpm, newWpmRecord: newWpmRecord, xp: xp.XP_COMPLETE_SPRINT});
                                        
                }

            }
            
            
            // Sort results
            result.sort(function(a, b){ 
                return a.count < b.count;
            });
                                   
            
            // Now we loop through them and apply extra xp
            for(var k = 0; k < result.length; k++){
                
                // If finished in top 5 and more than 1 person took part, get more exp
                if (k >= 0 && k <= 4 && result.length > 1){
                    
                    var pos = k + 1;
                    var newXp = Math.ceil(xp.XP_WIN_SPRINT / pos);
                                        
                    // Add to user record
                    xp.add(result[k].user, newXp);
                    result[k].xp += newXp;
                    
                }
                
            }
                        
                        
            // Unset the sprint data
            this.guildSettings.sprint = {};
            this.data.s(this.guildSettings);
            
            // Post the message
            var output = '\:checkered_flag: **THE RESULTS ARE IN**\n\nCongratulations to everyone:\n';
            for (var i = 0; i < result.length; i++){
                
                output += '`'+(i+1)+'`. <@' + result[i].user + '> - **' + result[i].count + ' words** ('+result[i].wpm+' wpm) ';
                
                if (result[i].newWpmRecord === 1){
                    output += '\:champagne: **NEW PB**'
                }
                
                output += '     +' + result[i].xp + 'xp';
                output += '\n';
                
            }
            
            msg.say(output);
            
        }
        
    }
    
    clear(){
        clearTimeout(this.messageTimeout);
    }
    
    
};