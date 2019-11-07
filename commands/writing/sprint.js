const { Command } = require('discord.js-commando');
const Database = require('./../../structures/db.js');
const XP = require('./../../structures/xp.js');
const Record = require('./../../structures/record.js');
const Stats = require('./../../structures/stats.js');
const Goal = require('./../../structures/goal.js');
const Project = require('./../../structures/project.js');
const Setting = require('./../../structures/settings.js');
const Event = require('./../../structures/event.js');
const lib = require('./../../lib.js');

const STAT_SPRINT_NOTIFY = 3;

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
            guildOnly: true,
            description: 'Write with your friends and see who can write the most in the time limit! Run `help sprint` for more information.',
            examples: [
                '`sprint start` Quickstart a sprint with the default settings',
                '`sprint for 20 in 3` Schedules a sprint for 20 minutes, to start in 3 minutes',
                '`sprint for 20 at :30` Schedules a sprint for 20 minutes, starting the next time it is half past the current hour (UTC)',
                '`sprint cancel` Cancels the current sprint. This can only be done by the person who created the sprint, or any users with the MANAGE_MESSAGES permission',
                '`sprint join` Joins the current sprint',
                '`sprint join 100` Joins the current sprint, with a starting word count of 100',
                '`sprint join 100 sword` Joins the current sprint, with a starting word count of 100 and sets your sprint to count towards your Project with the shortname "sword" (See: Projects for more info)',
                '`sprint leave` Leaves the current sprint',
                '`sprint project sword` Sets your sprint to count towards your Project with the shortname "sword" (See: Projects for more info)',
                '`sprint wc 250` Declares your final word count at 250',
                '`sprint time` Displays the time left in the current sprint',
                '`sprint users` Displays a list of the users taking part in the current sprint',
                '`sprint pb` Displays your personal best wpm from sprints on this server. Run `sprint pb reset` to reset your personal best to 0 on the current server',
                '`sprint notify` You will be notified when someone starts a new sprint',
                '`sprint forget` You will no longer be notified when someone starts a new sprint',
                '`sprint status` Shows you your current word count on the sprint',
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
        this.messageTimeout = [];
        this.stats = new Stats();
        this.finished = [];
        this.test = [];
                
    }

    run(msg, {opt1, opt2, opt3, opt4}) {
                                              
        let guildID = msg.guild.id;
                
        // Set the default values for finished and messagetimeout, if not set
        if (this.finished[guildID] === undefined){
            this.finished[guildID] = 0;
        }
                
        opt1 = opt1.toLowerCase();
        opt3 = opt3.toLowerCase();
        
        // Start a sprint
        if (opt1 === 'start'){
            return this.run_start(msg);
        }
        
        else if (opt1 === 'for'){
            if (opt3 == 'at'){
                const startTime = parseInt(opt4.indexOf(':') !== -1 ? opt4.substr(1) : opt4, 10);
                if (isNaN(startTime) || startTime === null || startTime === undefined || startTime >= 60) {
                    return msg.say('Sorry, I can\'t understand that - the correct command looks like this: `sprint for 20 at :05`')
                }
                
                opt4 = (60 + startTime - (new Date()).getMinutes()) % 60;
            }
            if (opt3 === 'now'){
                opt4 = 0;
            }
            return this.run_start(msg, opt2, opt4);
        }
        
        // Cancel the sprint
        else if (opt1 === 'cancel' || opt1 === 'stop'){
            return this.run_cancel(msg);
        }
        
        // Check time remaining
        else if (opt1 === 'time' || opt1 === 'tc'){
            return this.run_time(msg);
        }
        
        // Join the sprint
        else if (opt1 === 'join'){
            return this.run_join(msg, opt2, opt3);
        }
        
        else if (opt1 === 'leave'){
            return this.run_leave(msg);
        }
        
        else if (opt1 === 'users'){
            return this.run_users(msg);
        }
        
        else if (opt1 === 'wc' || opt1 === 'declare'){
            return this.run_declare(msg, opt2);
        }
        
        else if (opt1 === 'end'){
            return this.run_end(msg);
        }
        
        else if (opt1 === 'help'){
            return this.run_help(msg);
        }
        
        else if (opt1 === 'pb' || opt1 === 'record'){
            return this.run_pb(msg, opt2);
        }
        
        else if (opt1 === 'end'){
            return this.run_end(msg);
        } 
        
        else if (opt1 === 'notify'){
            return this.run_notify(msg);
        }  
        
        else if (opt1 === 'forget'){
            return this.run_forget(msg, opt2);
        }
        
        else if(opt1 === 'project'){
            return this.run_set_project(msg, opt2);
        }
        
        else if(opt1 === 'status'){
            return this.run_status(msg);
        }
        
        else if (opt1 === ''){
            return msg.say('Did you mean `sprint start`?');
        }
        
        else {
            
            var replyArray = ['Er...what?', 'I\'m too tired.', 'I can\'t do that Dave.', 'That sounds like a cool feature, maybe I should add it.', 'What are you trying to do?'];
            var rand = Math.round(Math.random() * (replyArray.length - 1));
            return msg.say( replyArray[rand] );
            
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
    
    get_user_current_wordcount(sprint, usr){
        
        var db = new Database();
        var result = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [sprint] = :s AND [user] = :u').get({ 
            s: sprint,
            u: usr
        });
        db.close();
        
        return (result.current_wc > 0) ? result.current_wc : result.starting_wc;
        
    }
    
    is_sprint_finished(sprint){
        
        var now = Math.floor(new Date() / 1000);        
        return (now > sprint.end);
        
    }
    
    is_declaration_finished(sprint){
        
        // Check all users
        var declared = 0;
        
        var db = new Database();
        var users = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [sprint] = :sp').all({ sp: sprint.id });
        
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
Write with your friends and see who can write the most in the time limit! Earn extra XP for finishing in the top 5!                    
                        
**Sprint Default Settings**
\`length\` ${this.defaults.length} minutes
\`delay\` ${this.defaults.delay} minute
                        
**Sprint Commands**
\`sprint start\` Quick-start a sprint with the default settings
\`sprint for 30 in 5\` Sprint for 30 minutes, starting in 5 minutes 
\`sprint for 30 now\` Sprint for 30 minutes, starting immediately
\`sprint join\` Join the current sprint
\`sprint join 1000\` Join the current sprint, with a starting wordcount of 1000 (written before the sprint started)
\`sprint join 1000 shortname\` Join the current sprint, with a starting wordcount of 1000 (written before the sprint started), writing towards one of your projects (specified by its shortname)
\`sprint leave\` Leave the current sprint
\`sprint project shortname\` Set your sprint wordcount to count towards one of your projects (specified by its shortname)
\`sprint time\` Check how long is remaining
\`sprint users\` Display a list of the users taking part in the sprint
\`sprint cancel\` Cancel the current sprint for all users (you must be the sprint creator or a server moderator to do this)
\`sprint wc 2000\` Declare your finished word count is 2000 words (total written by the end of the sprint)
\`sprint pb\` Shows you your Personal Best words-per-minute from sprints done on this server             
\`sprint notify\` You will be notified of any sprints which start on this server
\`sprint forget\` You will no longer be notified of any sprints which start on this server                        
                        
**Sprint Tips**
If you join the sprint with a starting wordcount, remember to declare your total word count at the end, not just the amount of words you wrote in the sprint.
e.g. if you joined with 1000 words, and during the sprint you wrote another 500 words, the final wordcount you should declare would be 1500
`;
        return msg.say(output);
        
    }
    
    run_set_project(msg, shortname){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var sprint = this.get(guildID);
        if (sprint){
            
            var userSprint = this.is_user_sprinting(sprint.id, userID);
            if (userSprint){
                
                var project = new Project(msg, guildID, userID);
                var record = project.get(shortname);                
                if (record){
                    
                    var db = new Database();

                    // Update their starting wordcount
                    db.conn.prepare('UPDATE [sprint_users] SET [project] = :pID WHERE [sprint] = :sp AND [user] = :usr').run({
                        pID: record.id,
                        sp: sprint.id,
                        usr: userID
                    });
                    
                    db.close();

                    return msg.reply('You are now sprinting in your project **'+record.name+'**');  
                    
                } else {
                    return msg.reply('You do not have a project with that shortname');
                }
                
            } else {
                return msg.reply('You must have joined the sprint before you can set which project you are writing in');
            }
            
        } else {
            return msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`.');            
        }
        
    }
    
    run_notify(msg){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        // Set them to be notified about upcoming sprints
        var stats = new Stats();
        stats.set(guildID, userID, 'sprint_notify', 1);
        
        return msg.say(`${msg.author.username}: You will be notified of any upcoming sprints. \`sprint forget\` to no longer be notified.`);        
        
    }
    
    run_forget(msg, name){
        
        let user = msg.author;
        let guildID = msg.guild.id;
        
        name = name.trim();
        
        // Are we removing someone else from the list?
        if (name.length > 0 && msg.member.hasPermission('MANAGE_MESSAGES')){
            user = lib.getMemberByName(msg, name);
            if (!user){
                return msg.say(`Unable to find user with that name.`);        
            }
        }
        
        // Set them to be notified about upcoming sprints
        var stats = new Stats();
        stats.set(guildID, user.id, 'sprint_notify', 0);
        
        return msg.say(`${user}: You will no longer be notified of upcoming sprints.`);        
        
    }
    
    run_end(msg){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        var sprint = this.get(guildID);
        
        if (sprint){
            
            // We can only cancel it if we are the creator of it, or we have the manage messages permission
            if (userID == sprint.createdby || msg.member.hasPermission('MANAGE_MESSAGES')){
                return this.post_end_message(msg);                
            } else {
                return msg.say('Only the sprint creator or a moderator can end this sprint.');
            }
            
        } else {
            return msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`.');            
        }
                
    }
    
    run_pb(msg, option){
               
        let userID = msg.author.id;
        let guildID = msg.guild.id;
        
        var record = new Record();
        
        // Reset
        if (option === 'reset'){
            record.set(guildID, userID, 'wpm', 0);
            return msg.say(`${msg.author}: Your personal best on this server has been reset to 0.`);     
        } else {        
            var userRecord = record.get(guildID, userID, 'wpm');
            if (userRecord){
                return msg.say(`${msg.author}: Your personal best is **${userRecord.value}** wpm.`);     
            } else {
                return msg.say(`${msg.author}: You do not yet have a wpm personal best on this server.`);
            }
        }
                
    }
    
    run_status(msg){
        
        var obj = this;
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
        
        var sprint = this.get(guildID);
        
        if (sprint){
            
            var userSprint = this.is_user_sprinting(sprint.id, userID);
            
            if (userSprint){
                
                var current = this.get_user_current_wordcount(sprint.id, userID);
                var diff = current - userSprint.starting_wc;
                return msg.say(`${msg.author}: Your current word count for this sprint is: ${current}. Total written in this sprint: ${diff}`);
                
            } else {
                return msg.reply('You must have joined the sprint before you can set which project you are writing in');
            }
            
        } else {
            return msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`.');            
        }
                    
    }
        
    run_declare(msg, amount){
        
        var obj = this;
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
                                
        var sprint = this.get(guildID);
        
        if (sprint){
            
            var userSprint = this.is_user_sprinting(sprint.id, userID);
            
            if (userSprint){

                var current = this.get_user_current_wordcount(sprint.id, userID);
                var calculation = false;
                
                // If they put a plus or minus in front of the number, do a calculation for them based on their starting_wc
                if (amount.charAt(0) === '+' || amount.charAt(0) === '-'){
                    
                    calculation = true;
                                                            
                    // Subtract
                    if (amount < 0){
                        
                        // Set the amount to the rest of the string
                        amount = amount.substr(1).trim();
                                                
                        // Subtract the amount from the starting wc
                        amount = current - parseInt(amount);
                                                
                    } else {
                        
                        // Set the amount to the rest of the string
                        amount = amount.substr(1).trim();
                        
                        // Add the amount to the starting wc
                        amount = current + parseInt(amount);
                        
                    }
                                                            
                }
                
                // Check amount is valid
                if (!lib.isNumeric(amount)){
                    msg.say('Please enter a valid word count.');
                    return null;
                }

                amount = Math.floor(amount);
                
                // If the submitted wordcount is less than they started with (and they did not specifcy a negative number), show error
                if (amount < userSprint.starting_wc && calculation === false){
                    return msg.say(`Word count ${amount} is less than the wordcount you started with (${userSprint.starting_wc})!\nIf you joined with a starting wordcount, make sure to declare your new total wordcount, not just the amount you wrote in this sprint.\nIf you really ARE trying to lower your word count for this sprint, try doing \`sprint wc -${current - amount}\``);
                }

                var db = new Database();
                
                // If the sprint is finished, set it in the [ending_wc], otherwise if it's still running use the [current_wc]
                if (this.is_sprint_finished(sprint)){
                    var col = 'ending_wc';
                } else {
                    var col = 'current_wc';
                }

                // Update record
                db.conn.prepare('UPDATE [sprint_users] SET ['+col+'] = :wc WHERE [sprint] = :sp AND [user] = :usr').run({
                    wc: amount,
                    sp: sprint.id,
                    usr: userID
                });

                // Get user record
                var user = this.is_user_sprinting(sprint.id, userID);

                db.close();
                
                // Which number are we using to display?
                if (this.is_sprint_finished(sprint)){
                    var wordcount = user.ending_wc;
                } else {
                    var wordcount = user.current_wc;
                }

                var written = wordcount - user.starting_wc;

                msg.say(`${msg.author}: You updated your word count to: ${wordcount}. Total written in this sprint: ${written}.`);
               
                // Is the sprint over?
                // Are all users declared now?
                if (this.is_sprint_finished(sprint) && this.is_declaration_finished(sprint) && this.finished[guildID] === 0){
                    
                    msg.say('The word counts are in. Results coming up shortly...');
                    
                    this.finished[guildID] = 1;
                    
                    this.timeout(guildID, 10000, function(){
                        obj.finish(msg);
                    });
                    
                    
                }
            
            }
            
        }
        
        
    }
    
    
    run_users(msg){
        
        let guildID = msg.guild.id;
        var sprint = this.get(guildID);
        
        if (sprint){
            
            
            var db = new Database();
            var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [sprint] = :sp').all({ sp: sprint.id });
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
            
            return msg.say(output);            
            
        } else {
            return msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`.');            
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
            
            msg.say(`${msg.author}: You have abandoned the sprint.`);
            
            // Are there any participants left? If not, cancel it
            var participants = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [sprint] = :sp').all({ sp: sprint.id });
            if (participants.length === 0){
                
                // Delete sprint
                db.conn.prepare('DELETE FROM [sprints] WHERE [id] = ?').run([sprint.id]);
                                
                // Clear the timeout
                this.clear(guildID);
                
                // Decrement the creator's stat
                this.stats.dec(guildID, sprint.createdby, 'sprints_started', 1);
                
                var output = '**Sprint has been cancelled**\nEverybody left and I\'m not doing this alone.';
                msg.say(output);
                
            }
            
            db.close();

            
        } else {
            msg.say(`${msg.author}: You are not taking part in a sprint at the moment.`);
        }
                
    }
    
    
    run_join(msg, start, shortname){
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
                        
        var sprint = this.get(guildID);
        
        if (!lib.isNumeric(start)){
            start = 0;
        }
        
        if (sprint){
            
            var db = new Database();

            if (!this.is_user_sprinting(sprint.id, userID)){
                
                var now = Math.floor(new Date() / 1000);
                var timejoined = now;
                
                // If the sprint hasn't actually started yet, set timejoined to the start time.
                if (sprint.start > now){
                    timejoined = sprint.start;
                }

                // Join sprint
                db.conn.prepare('INSERT INTO [sprint_users] (sprint, user, starting_wc, ending_wc, timejoined) VALUES (:sp, :usr, :st, :end, :time)').run({
                    sp: sprint.id,
                    usr: userID,
                    st: start,
                    end: 0,
                    time: timejoined
                });
                
                msg.reply(`You have joined the sprint with ${start} words.`);
                
            } else {
                
                // Update their starting wordcount
                db.conn.prepare('UPDATE [sprint_users] SET [starting_wc] = :strt WHERE [sprint] = :sp AND [user] = :usr').run({
                    strt: start,
                    sp: sprint.id,
                    usr: userID
                });
                
                msg.reply(`Your starting word count has been set to ${start}.`);  
            }
            
            // Set which project they are sprinting towards
            if (shortname !== undefined && shortname.length > 0){
                
                var project = new Project(msg, guildID, userID);
                var record = project.get(shortname);                
                if (record){

                    // Update their starting wordcount
                    db.conn.prepare('UPDATE [sprint_users] SET [project] = :pID WHERE [sprint] = :sp AND [user] = :usr').run({
                        pID: record.id,
                        sp: sprint.id,
                        usr: userID
                    });

                    return msg.reply('You are now sprinting in your project **'+record.name+'**');  

                } else {
                    return msg.reply('You do not have a project with that shortname ('+shortname+')');
                }

            }
                        
            db.close();
            
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`.');
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
               msg.say('Waiting for word counts. If the results haven\'t been posted within 2 minutes, try forcing the sprint to end with\`sprint end\`.');            
           }
            
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`.');            
        }
                    
    }
    
    run_cancel(msg){
                
        // Check to make sure there is an active sprint on this guild/server
        let userID = msg.author.id;
        let guildID = msg.guild.id;
                        
        var sprint = this.get(guildID);
        
        if (sprint){
            
            if (userID == sprint.createdby || msg.member.hasPermission('MANAGE_MESSAGES')){
                
                // Get the users to notify
                var users = [];
                var db = new Database();
                
                var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [sprint] = :sp').all({ sp: sprint.id });

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
                this.clear(guildID);
                
                // Decrement their stat
                if (userID == sprint.createdby){
                    this.stats.dec(guildID, userID, 'sprints_started', 1);
                }
                
                var output = '**Sprint has been cancelled**: ';
                output += users.join(', ');
                msg.say(output);
                
            } else {
                msg.say('Only the sprint creator or a moderator can cancel this sprint.');
            }
            
        } else {
            msg.say('There is no active sprint at the moment. Maybe you should start one? `sprint start`.');            
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
                        
            this.finished[guildID] = 0;
            
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
            db.conn.prepare('INSERT INTO [sprints] (guild, start, end, end_reference, length, createdby, created) VALUES (:g, :s, :e, :eref, :l, :cb, :c)').run({
                g: guildID,
                s: start,
                l: length,
                e: end,
                eref: end,
                cb: userID,
                c: now
            });
            
            sprint = this.get(guildID);
            
            // Join sprint
            db.conn.prepare('INSERT INTO [sprint_users] (sprint, user, starting_wc, ending_wc, timejoined) VALUES (:sp, :usr, :st, :end, :time)').run({
                sp: sprint.id,
                usr: userID,
                st: 0,
                end: 0,
                time: start
            });
            
            // Increment sprint_started stat
            this.stats.inc(guildID, userID, 'sprints_started', 1);
            
                       
            // If we are starting immediately, display that message instead of the standard one
            if (delay === 0){

                // Post the normal start message
                this.post_start_message(msg);

                // Then notify the users below
                var notify = [];
                var notifyUsers = db.conn.prepare('SELECT [user] FROM [user_stats] WHERE [guild] = :guild AND name = :name AND VALUE = 1').all({
                    guild: guildID,
                    name: 'sprint_notify'
                });
                
                for (var i = 0; i < notifyUsers.length; i++){
                    
                    // Make sure they are still in the server
                    var userObj = msg.guild.members.find('id', notifyUsers[i].user);
                    
                    if (userObj && notify.indexOf('<@'+notifyUsers[i].user+'>') < 0){
                        notify.push('<@'+notifyUsers[i].user+'>');
                    }
                    
                }
                
                // If any users have asked to be notified of upcoming sprints, notify them here
                if (notify.length > 0){
                    output = '\:bell: Sprint notifications: ';
                    output += notify.join(', ');
                    msg.say(output);
                }
                               
                                                
            } else {
            
                var left = lib.secsToMins( (delay / 1000) );

                var output = '\**A new sprint has been scheduled**\nSprint will start in ' + left.m + ' minute(s) and will run for ' + sFor + ' minute(s). Use `sprint join <wordcount>` to join this sprint.\n';
                var notify = ['<@'+userID+'>'];
                
                // Who else wants to be notified?
                var notifyUsers = db.conn.prepare('SELECT [user] FROM [user_stats] WHERE [guild] = :guild AND name = :name AND VALUE = 1').all({
                    guild: guildID,
                    name: 'sprint_notify'
                });
                
                for (var i = 0; i < notifyUsers.length; i++){
                    
                    // Make sure they are still in the server
                    var userObj = msg.guild.members.find('id', notifyUsers[i].user);
                    
                    if (userObj && notify.indexOf('<@'+notifyUsers[i].user+'>') < 0){
                        notify.push('<@'+notifyUsers[i].user+'>');
                    }
                    
                }
                
                output += notify.join(', ');
                msg.say(output);

                // Set timeout to alert users when it starts
                this.timeout(guildID, delay, function(){
                    obj.post_start_message(msg);
                });
               
            
            }
            
            db.close();
            
        } else {
            msg.say('There is already a sprint running on this server. Please wait until it has finished before creating a new one.');
        }
                
    }
    
    post_start_message(msg){
        
        let guildID = msg.guild.id;
        
        var obj = this;
        var sprint = this.get(guildID);
        
        // Check to make sure there is an active sprint on this guild/server
        if (sprint && sprint.end > 0){
                            
            // Get all the users to notify
            var users = [];
            
            var db = new Database();
            var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [sprint] = :sp').all({ sp: sprint.id });
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
                        
            // Set the new timeout for the ending message
            var delay = diff * 1000;
            this.timeout(guildID, delay, function(){
                obj.post_end_message(msg);
            });
            
            // Post the starting message
            var output = '**Sprint has started**\nGet writing, you have ' + left.m + ' minute(s).\n';
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
            
            var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [sprint] = :sp').all({ sp: sprint.id });
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
            this.clear(guildID);
            
            // Is there a guild setting for the delay?
            var settings = new Setting();
            
            var setting = settings.get(guildID, 'sprint_delay_end');
            if (setting && lib.isNumeric(setting.value) && setting.value <= 15){
                var delay = setting.value * 60; // This will be in mins, so convert to seconds
            } else {
                var delay = this.defaults.post_delay;
            }
            
            // Convert to ms
            delay *= 1000;
            
            // Set the new timeout for the ending message
            this.timeout(guildID, delay, function(){
                obj.finish(msg);
            });
                        
            // Post the ending message
            var output = '**Time is up**\nPens down. Use `sprint wc <amount>` to submit your final word counts, you have ' + Math.round((delay/1000) / 60) + ' minute(s).\n';
            output += users.join(', ');
            msg.say(output);
                        
            
        }
        
    }
    
    
    finish(msg){
        
        let guildID = msg.guild.id;
        var sprint = this.get(guildID);
        var now = Math.floor(new Date() / 1000);
        var record = new Record();
        
        if (sprint && sprint.completed == 0){
            
            var db = new Database();
            
            // Clear the timeout, in case we've finished before the ending timer
            this.clear(guildID);
            
            // Get users & calculate positions
            var result = [];
            
            var records = db.conn.prepare('SELECT * FROM [sprint_users] WHERE [sprint] = :sp').all({ sp: sprint.id });
            if (records){
                
                for (var i = 0; i < records.length; i++){
                    
                    var guildUser = lib.getMember(msg, records[i].user);
                    var user = records[i];
                                        
                    if (guildUser){

                        // If the user didn't submit an ending_wc, but they do have a current_wc, use that
                        if (user.ending_wc == 0){
                            user.ending_wc = user.current_wc;
                        }
                    
                        // Now just do the ones who have something for the ending
                        if (user.ending_wc > 0){

                            var count = user.ending_wc - user.starting_wc;
                            var timesprinted = sprint.end_reference - user.timejoined;
                            
                            // If for whatever reason, the timejoined or sprint.end_reference is 0 then use sprint start time.
                            if (user.timejoined <= 0 || sprint.end_reference == 0){
                                timesprinted = sprint.length;
                            } 
                            
                            // Calculate WPM based on the time they sprinted, not just from the sprint length.
                            var wpm = Math.round( (count / (timesprinted / 60)) * 100 ) / 100;
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

                            // Increment their stats
                            this.stats.inc(guildID, user.user, 'sprints_completed', 1);
                            this.stats.inc(guildID, user.user, 'sprints_words_written', count);
                            this.stats.inc(guildID, user.user, 'total_words_written', count);

                            // Increment their words towards their daily goal
                            var goal = new Goal(msg, guildID, user.user);
                            goal.inc(count);

                            // If they were writing to a project, update that word count
                            if(user.project > 0){

                                var project = new Project(msg, guildID, user.user);
                                var userProject = project.getByID(user.project);
                                if (userProject){
                                    project.increment(user.project, count);
                                }

                            }
                            
                            // Is there an event running?
                            var event = new Event(msg.guild.id);
                            if (event.is_running()){
                                var eventWordCount = event.getUserWordCount(guildUser.user.id);
                                event.update(guildUser.user, (eventWordCount + count));
                            }

                            // Push to result dataset
                            result.push({user: user.user, count: count, wpm: wpm, newWpmRecord: newWpmRecord, xp: xp.XP_COMPLETE_SPRINT});       
                            
                        }
                    
                    }
                    
                }
                
                // Sort results
                result.sort(function(a, b){ 
                    return b.count - a.count;
                });
                
                // Now we loop through them and apply extra xp
                for(var k = 0; k < result.length; k++){

                    // If finished in top 5 and more than 1 person took part, get more exp
                    if (k >= 0 && k <= 4 && result.length > 1){

                        var pos = k + 1;
                        var newXp = Math.ceil(xp.XP_WIN_SPRINT / pos);

                        // Add to user record
                        var xp = new XP(guildID, result[k].user, msg);
                        xp.add(newXp);
                        result[k].xp += newXp;
                        
                        // If they won, increment that stat
                        if (pos === 1){
                            this.stats.inc(guildID, result[k].user, 'sprints_won', 1);
                        }

                    }

                }
                
                // If we were the only one taking part, may as well mark it as a win
                if (result.length === 1){
                    this.stats.inc(guildID, result[0].user, 'sprints_won', 1);
                }
                
                // Mark the sprint as complete
                db.conn.prepare('UPDATE [sprints] SET [completed] = ? WHERE [id] = ?').run([now, sprint.id]);
                
                // Post the message
                if (result.length > 0){               
                    var output = '\:trophy: **Sprint Results** \:trophy:\nCongratulations to everyone.\n';
                    for (var i = 0; i < result.length; i++){

                        output += '`'+(i+1)+'`. <@' + result[i].user + '> - **' + result[i].count + ' words** ('+result[i].wpm+' wpm) ';

                        if (result[i].newWpmRecord === 1){
                            output += '\:champagne: **NEW PB**';
                        }

                        output += '     +' + result[i].xp + 'xp';
                        output += '\n';

                    }
                } else {
                    var output = 'No-one submitted their wordcounts... I guess I\'ll just cancel the sprint... \:frowning:';
                }

                msg.say(output);
                
            }
                        
            this.finished[guildID] = 0;            
            
            db.close();
            
        }
        
        
    }
    
    timeout(guildID, delay, callback){
        this.clear(guildID);
        this.messageTimeout[guildID] = setTimeout(callback, delay);
    }
    
    // This basically doesn't work, I don't know why
    clear(guildID){
        clearTimeout(this.messageTimeout[guildID]);
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