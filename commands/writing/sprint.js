const { Command } = require('discord.js-commando');
const Database = require('./../../structures/db.js');
const XP = require('./../../structures/xp.js');
const Record = require('./../../structures/record.js');
const lib = require('./../../lib.js');

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
            examples: [
                '`sprint start` Quickstart a sprint with the default settings',
                '`sprint for 20 in 3` Schedules a sprint for 20 minutes, to start in 3 minutes',
                '`sprint cancel` Cancels the current sprint. This can only be done by the person who created the sprint, or any users with the MANAGE_MESSAGES permission',
                '`sprint join` Joins the current sprint',
                '`sprint join 100` Joins the current sprint, with a starting word count of 100',
                '`sprint leave` Leaves the current sprint',
                '`sprint wc 250` Declares your final word count at 250',
                '`sprint time` Displays the time left in the current sprint',
                '`sprint users` Displays a list of the users taking part in the current sprint',
                '`sprint pb` Displays your personal best wpm from sprints on this server',
                '`sprint help` Displays a similar help screen to this one, with a few added bits of info'
            ],
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
        
        else if (opt1 === 'end'){
            this.run_end(msg);
        }
        
    }
    
    get(guild){
        
        // Check if there is a sprint on this server
        var db = new Database();
        var result = db.conn.prepare('SELECT * FROM [sprints] WHERE [guild] = :g AND [completed] = 0').get({ g: guild });
        db.close();
        
        return result;
        
    }
    
    
    is_user_sprinting(sprint, usr){
        
        // Check if you are already in the sprint
        var db = new Database();
        var result = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [sprint] = :s AND [user] = :u').get({ 
            s: sprint,
            u: usr
        });
        db.close();
        
        return (result);
        
    }
    
    is_sprint_finished(sprint){
        
        var now = Math.floor(new Date() / 1000);        
        return (now > sprint.end);
        
    }
    
    is_declaration_finished(sprint){
        
        // Check all users
        var declared = 0;
        
        var db = new Database();
        var users = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [id] = :sp').all({ sp: sprint.id });
        
        for (var i = 0; i < users.length; i++){
            if (users[i].ending_wc > 0){
                declared++;
            }
        }
        
        db.close();
        
        return (declared === users.length);        
         
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
    
    run_end(msg){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        var sprint = this.get(guildID);
        
        if (sprint){
            
            // We can only cancel it if we are the creator of it, or we have the manage messages permission
            if (userID == sprint.createdby || msg.member.hasPermission('MANAGE_MESSAGES')){
                this.post_end_message(msg);                
            } else {
                msg.say('Only the sprint creator or a moderator can end this sprint.');
            }
            
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`');            
        }
                
    }
    
    run_pb(msg){
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
        
        var record = new Record();
        var userRecord = record.get(guildID, userID, 'wpm');
        if (userRecord){
            return msg.say(`${msg.author}, your personal best is **${userRecord.value}** words-per-minute`);     
        } else {
            return msg.say('You do not yet have a words-per-minute personal best');
        }
                
    }
        
    run_declare(msg, amount){
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
                        
        var sprint = this.get(guildID);
        
        if (sprint){
            
            var userSprint = this.is_user_sprinting(sprint.id, userID);
            
            if (userSprint){

                // Is the actually sprint finished yet?
                if (!this.is_sprint_finished(sprint)){
                    msg.say('The sprint hasn\'t finished yet. Please wait and declare your word count at the end.');
                    return null;
                }

                // Check amount is valid
                if (!lib.isNumeric(amount)){
                    msg.say('Please enter a valid word count');
                    return null;
                }

                amount = Math.floor(amount);
                
                // If the submitted wordcount is less than they started with, show error
                if (amount < userSprint.starting_wc){
                    return msg.say(`Word count ${amount} is less than the wordcount you started with (${userSprint.starting_wc})! If you joined with a starting wordcount, make sure to declare your new total wordcount, not just the amount you wrote in this sprint.`);
                }

                var db = new Database();

                // Update record
                db.conn.prepare('UPDATE [sprint_users] SET [ending_wc] = :wc WHERE [sprint] = :sp AND [user] = :usr').run({
                    wc: amount,
                    sp: sprint.id,
                    usr: userID
                });

                // Get user record
                var user = this.is_user_sprinting(sprint.id, userID);

                db.close();

                var written = user.ending_wc - user.starting_wc;

                msg.say(`${msg.author} word count updated: ${user.ending_wc} (${written} new)`);

                // Are all users declared now?
                if (this.is_declaration_finished(sprint)){
                    this.finish(msg);
                }
            
            }
            
        }
        
        
    }
    
    
    run_users(msg){
        
        let guildID = msg.guild.id;
        var sprint = this.get(guildID);
        
        if (sprint){
            
            
            var db = new Database();
            var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [id] = :sp').all({ sp: sprint.id });
            db.close();
            
            if (records){
                
                // Get all the users
                var users = [];
                
                for (var i = 0; i < records.length; i++){
                    var user = lib.getMember(msg, records[i].user);
                    if (user){
                        users.push( user.user.username + ' ('+records[i].starting_wc+')');
                    }
                }
                                
                var output = (users.length > 0) ? 'Sprint Participants: ' + users.join(', ') : 'There are no users currently taking part in this sprint.';
                
            } else {
                var output = 'There are no users currently taking part in this sprint.';
            }
            
            msg.say(output);            
            
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`');            
        }
        
        
    }
    
    run_leave(msg){
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
                        
        var sprint = this.get(guildID);
        
        if (sprint && this.is_user_sprinting(sprint.id, userID)){
            
            var db = new Database();
            db.conn.prepare('DELETE FROM [sprint_users] WHERE [sprint] = :sp AND [user] = :usr').run({
                sp: sprint.id,
                usr: userID
            });
            db.close();
            
            msg.say('You have left the sprint.');
            
        } else {
            msg.say('You are not taking part in a sprint at the moment.');
        }
                
    }
    
    
    run_join(msg, start){
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
                        
        var sprint = this.get(guildID);
        
        if (!lib.isNumeric(start)){
            start = 0;
        }
        
        if (sprint){
            
            var db = new Database();

            if (!this.is_user_sprinting(sprint.id, userID)){
                
                // Join sprint
                db.conn.prepare('INSERT INTO [sprint_users] (sprint, user, starting_wc, ending_wc) VALUES (:sp, :usr, :st, :end)').run({
                    sp: sprint.id,
                    usr: userID,
                    st: start,
                    end: 0
                });
                
                msg.say('You have joined the sprint, with ' + start + ' words.');
                
            } else {
                
                // Update their starting wordcount
                db.conn.prepare('UPDATE [sprint_users] SET [starting_wc] = :strt WHERE [sprint] = :sp AND [user] = :usr').run({
                    strt: start,
                    sp: sprint.id,
                    usr: userID
                });
                
                msg.say('Updated your starting wordcount to: ' + start);  
            }
            
            db.close();
            
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`');
        }
        
    }
    
    
    run_time(msg){
        
        var now = Math.floor(new Date() / 1000);
        let guildID = msg.guild.id;
        var sprint = this.get(guildID);
        
        if (sprint){
            
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
           } else {
               msg.say('Hmm. The sprint appears to be finished. If it hasn\'t asked you to declare your word-counts, try forcing it to end with `sprint end`');            
           }
            
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`');            
        }
                    
    }
    
    run_cancel(msg){
                
        // Check to make sure there is an active sprint on this guild/server
        let userID = msg.author.id;
        let guildID = msg.guild.id;
                        
        var sprint = this.get(guildID);
        
        if (sprint){
            
            if (userID === sprint.createdby || msg.member.hasPermission('MANAGE_MESSAGES')){
                
                // Get the users to notify
                var users = [];
                var db = new Database();
                
                var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [id] = :sp').all({ sp: sprint.id });

                if (records){
                    for (var i = 0; i < records.length; i++){
                        var u = lib.getMember(msg, records[i].user);
                        if (u){
                            users.push(`<@${u.id}>`);
                        }
                    }
                }
                
                // Delete sprint
                db.conn.prepare('DELETE FROM [sprints] WHERE [id] = ?').run([sprint.id]);
                
                // Delete sprint users
                db.conn.prepare('DELETE FROM [sprint_users] WHERE [sprint] = ?').run([sprint.id]);
                
                db.close();
                
                // Clear the timeout
                this.clear();
                
                var output = '\:disappointed: **SPRINT CANCELLED**\n\n';
                output += users.join(', ');
                msg.say(output);
                
            } else {
                msg.say('Only the sprint creator or a moderator can cancel this sprint.');
            }
            
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`');            
        }
         
                 
    }
    
    
    run_start(msg, sFor, sIn){
                
        let userID = msg.author.id;
        let guildID = msg.guild.id;
                
        var obj = this;
        var now = Math.floor(new Date() / 1000);
        
        var sprint = this.get(guildID);
          
        // Check if there is a sprint, but it's finished, we can remove it
        if ( sprint && this.is_sprint_finished(sprint) ){
            this.complete_record(sprint);           
        }
                     
          
        // Check to make sure there is no active sprint on this guild/server
        if (!sprint){
            
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
            var length = end - start;
            var delay = (start - now) * 1000;
                        
            var db = new Database();
            
            // Create sprint
            db.conn.prepare('INSERT INTO [sprints] (guild, start, end, length, createdby, created) VALUES (:g, :s, :e, :l, :cb, :c)').run({
                g: guildID,
                s: start,
                l: length,
                e: end,
                cb: userID,
                c: now
            });
            
            sprint = this.get(guildID);
            
            // Join sprint
            db.conn.prepare('INSERT INTO [sprint_users] (sprint, user, starting_wc, ending_wc) VALUES (:sp, :usr, :st, :end)').run({
                sp: sprint.id,
                usr: userID,
                st: 0,
                end: 0
            });
            
            db.close();
                       
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
        
        let guildID = msg.guild.id;
        
        var obj = this;
        var sprint = this.get(guildID);
        
        // Check to make sure there is an active sprint on this guild/server
        if (sprint){
                            
            // Get all the users to notify
            var users = [];
            
            var db = new Database();
            var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [id] = :sp').all({ sp: sprint.id });
            db.close();
            
            if (records){
                for (var i = 0; i < records.length; i++){
                    var u = lib.getMember(msg, records[i].user);
                    if (u){
                        users.push(`<@${u.id}>`);
                    }
                }
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
        
        let guildID = msg.guild.id;
        var obj = this;
        var sprint = this.get(guildID);
        
        if (sprint){
            
            var db = new Database();

            // Update the end timestamp to 0, just so we know it's defintely ended
            if (sprint.end > 0){
                db.conn.prepare('UPDATE [sprints] SET [end] = 0 WHERE [id] = ?').run([sprint.id]);
            }
            
            // Get users to notify
            var users = [];
            
            var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [id] = :sp').all({ sp: sprint.id });
            db.close();
            
            if (records){
                for (var i = 0; i < records.length; i++){
                    var u = lib.getMember(msg, records[i].user);
                    if (u){
                        users.push(`<@${u.id}>`);
                    }
                }
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
        
        let guildID = msg.guild.id;
        var sprint = this.get(guildID);
        var now = Math.floor(new Date() / 1000);
        var record = new Record();
        
        if (sprint){
            
            var db = new Database();
            
            // Clear the timeout, in case we've finished before the ending timer
            this.clear();
            
            // Get users & calculate positions
            var result = [];
            
            var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [id] = :sp').all({ sp: sprint.id });
            if (records){
                
                for (var i = 0; i < records.length; i++){
                    
                    var guildUser = lib.getMember(msg, records[i].user);
                    var user = records[i];
                    if (guildUser && user.ending_wc > 0){
                        
                        var count = user.ending_wc - user.starting_wc;
                        var wpm = Math.round( (count / (sprint.length / 60)) * 100 ) / 100;
                        var newWpmRecord = 0;
                        
                        // Check record
                        var userRecord = record.get(guildID, user.user, 'wpm');
                        if (!userRecord || userRecord.value < wpm){
                            record.set(guildID, user.user, 'wpm', wpm);
                            newWpmRecord = 1;
                        }
                                                
                        // Give them xp
                        var xp = new XP(guildID, user.user, msg);
                        xp.add(xp.XP_COMPLETE_SPRINT);
                        
                        // Push to result dataset
                        result.push({user: user.user, count: count, wpm: wpm, newWpmRecord: newWpmRecord, xp: xp.XP_COMPLETE_SPRINT});                                        
                        
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
                        var xp = new XP(guildID, result[k].user);
                        xp.add(result[k].user, newXp);
                        result[k].xp += newXp;

                    }

                }
                
                // Mark the sprint as complete
                db.conn.prepare('UPDATE [sprints] SET [completed] = ? WHERE [id] = ?').run([now, sprint.id]);
                
                // Post the message
                var output = '\:trophy: **THE RESULTS ARE IN**\n\nCongratulations to everyone:\n';
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
                        
            
            db.close();
            
        }
        
        
    }
    
    clear(){
        clearTimeout(this.messageTimeout);
    }
    
    complete_record(sprint){
        
        var now = Math.floor(new Date() / 1000);
        var db = new Database();
        db.conn.prepare('UPDATE [sprints] SET [completed] = :now WHERE [id] = :id').run({
            now: now,
            id: sprint.id
        });
        
        db.close();
        
    }
    
    
};