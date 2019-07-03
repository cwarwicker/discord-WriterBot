const { Command } = require('discord.js-commando');
const util = require('util');
const lib = require('./../../lib.js');

const XP = require('./../../structures/xp.js');
const Database = require('./../../structures/db.js');
const Stats = require('./../../structures/stats.js');

module.exports = class ChallengeCommand extends Command {
    constructor(client) {
                
        super(client, {
            name: 'challenge',
            aliases: [],
            group: 'writing',
            memberName: 'challenge',
            guildOnly: true,
            description: 'Generates a random writing challenge for you. e.g. "Write 400 words in 15 minutes". You can add the flags "easy", "normal", "hard", "hardcore", or "insane" to choose a pre-set wpm, or add your chosen wpm as the flag, or you can specify a time instead by adding a the time in minutes, prefixed with a "t", e.g. "t15"',
            examples: [
                '`challenge` - Generates a random writing challenge', 
                '`challenge cancel` - Cancels your current challenge', 
                '`challenge done` - Completes your current challenge', 
                '`challenge easy` - Generates a random writing challenge, at 5 wpm (20xp)', 
                '`challenge normal` - Generates a random writing challenge, at 10 wpm (40xp)', 
                '`challenge hard` - Generates a random writing challenge, at 20 wpm (75xp)', 
                '`challenge hardcore` - Generates a random writing challenge, at 40 wpm (100xp)', 
                '`challenge insane` - Generates a random writing challenge, at 60 wpm (150xp)', 
                '`challenge 10` - Generates a random writing challenge, at 10 wpm', 
                '`challenge t15` - Generates a random writing challenge, with a duration of 15 minutes', 
                '`challenge hard t30` - Generates a writing challenge at 20 wpm, with a duration of 30 minutes'
            ],
            args: [
                {
                    key: 'flag',
                    prompt: '',
                    default : '',
                    type: 'string'
                },
                {
                    key: 'flag2',
                    prompt: '',
                    default : '',
                    type: 'string'
                }
            ]
        });
        
        this.wpm = {min: 5, max: 30};
        this.times = {min: 5, max: 45};
        this.waiting = [];
        this.stats = new Stats();
                
    }

    has_challenge(id){
        return (this.get_challenge() !== undefined);
    }


    get_challenge(guild, id){
                            
        var db = new Database();
        var userChallenge = db.conn.prepare('SELECT * FROM [user_challenges] WHERE guild = ? AND user = ? AND completed = 0').get([guild, id]);
        db.close();
                
        return (userChallenge);
        
    }
    
    calculate_xp(wpm){
        
        // Default minimum value
        var xp = 20;
        
        // Easy
        if(wpm <= 5){
            xp = 20;
        } 
        // Normal
        else if(wpm <= 10){
            xp = 40;
        } 
        // Hard
        else if(wpm <= 20){
            xp = 75;
        } 
        // Hardcore
        else if(wpm <= 40){
            xp = 100;
        } 
        // Insane
        else if(wpm <= 60){
            xp = 150;
        } 
        // Custom > 60
        else if(wpm > 60) {
            xp = 200;
        }
        
        return xp;
        
    }
    
    set_challenge(msg, usr, challenge, xp){
        
       var userChallenge = this.get_challenge(msg.guild.id, usr);
       if (userChallenge){
           return msg.say(`${msg.author}: ${lib.get_string(msg.guild.id, 'challenge:alreadyactive')}`);
       } else {
           
           var db = new Database();
           db.conn.prepare('INSERT INTO [user_challenges] (guild, user, challenge, xp) VALUES (:g, :u, :c, :xp)').run({
               g: msg.guild.id,
               u: usr,
               c: challenge,
               xp: xp
           });
           db.close();
           
           return null;
           
       }
                
    }
    
    run_complete(msg){
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
        
        var userChallenge = this.get_challenge(guildID, userID);
        var now = Math.floor(new Date() / 1000);

        if (userChallenge){
            
            // Mark the challenge as completed
            var db = new Database();
            db.conn.prepare('UPDATE [user_challenges] SET completed = :c WHERE id = :i').run({
                c: now,
                i: userChallenge.id
            });
            
            // Add xp
            var xp = new XP(guildID, userID, msg); 
            xp.add(userChallenge.xp);
            
            // Increment stat
            this.stats.inc(guildID, userID, 'challenges_completed', 1);

            return msg.say(`${msg.author}: ${lib.get_string(msg.guild.id, 'challenge:completed')} **${userChallenge.challenge}**     +${userChallenge.xp} xp`);            
            
        } else {
            return msg.say(`${msg.author}: ${lib.get_string(msg.guild.id, 'challenge:noactive')}`);
        }
        
    }
    
    run_cancel(msg){
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
        
        var userChallenge = this.get_challenge(guildID, userID);
        
        if (userChallenge){
            
            var db = new Database();
            db.conn.prepare('DELETE FROM [user_challenges] WHERE id = :id').run({ id: userChallenge.id });
            db.close();
            
            return msg.say(`${msg.author} ${lib.get_string(msg.guild.id, 'challenge:givenup')}`);
            
        } else {
            return msg.say(`${msg.author}: ${lib.get_string(msg.guild.id, 'challenge:noactive')}`);
        }
        
    }
    
    run_challenge(msg, flag, flag2){
                
        flag = flag.toLowerCase();
                
        let userID = msg.author.id;
        let guildID = msg.guild.id;
                
        var userChallenge = this.get_challenge(guildID, userID);
        
        if (userChallenge){
            return msg.say(`${msg.author}: ${lib.get_string(msg.guild.id, 'challenge:current')}: **${userChallenge.challenge}**\n${lib.get_string(msg.guild.id, 'challenge:tocomplete')}`);
        } else {
                        
            var key = lib.findObjectArrayKeyByKey(this.waiting, 'guild', guildID);
            var uKey = this.waiting[key].users.indexOf(userID);
            
            var wait = this.waiting[key].users[uKey];
            if (wait >= 0){
                msg.say(lib.get_string(msg.guild.id, 'challenge:plsrespond'));
                return null;
            }
            
            var wpm = Math.floor(Math.random()*(this.wpm.max - this.wpm.min + 1) + this.wpm.min);
            
            // Specify the wpm by name or number
            if (flag === 'easy'){
                wpm = 5;
            } else if (flag === 'normal'){
                wpm = 10;
            } else if (flag === 'hard'){
                wpm = 20;
            } else if (flag === 'hardcore'){
                wpm = 40;
            } else if (flag === 'insane'){
                wpm = 60;
            } else if (lib.isNumeric(flag) && flag > 0){
                wpm = flag;
            }
            
            var time = Math.floor(Math.random()*(this.times.max - this.times.min + 1) + this.times.min);
            
            // Specify the time
            if (flag.startsWith('t')){
                time = flag.replace(/[^0-9]/, '');
            } else if (flag2.startsWith('t')){
                time = flag2.replace(/[^0-9]/, '');
            }
            
            var goal = wpm * time;
            var xp = this.calculate_xp(wpm);

            // Round it down to a neater number
            goal = Math.round(goal / 10) * 10;

            var challenge = util.format( lib.get_string(msg.guild.id, 'challenge:challenge'), goal, time, wpm );

            msg.say(`${msg.author}: ${lib.get_string(msg.guild.id, 'challenge:yourchallenge')}: ${challenge}. ${lib.get_string(msg.guild.id, 'challenge:decide')}`);
            
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

                    this.set_challenge(msg, userID, challenge, xp);
                    msg.say(`${msg.author}: ${lib.get_string(msg.guild.id, 'challenge:accepted')}: **${challenge}**\n${lib.get_string(msg.guild.id, 'challenge:tocomplete')}`);

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
        

        
    }
    
    run_list(msg){
        
        let guildID = msg.guild.id;

        var db = new Database();
        var challenges = db.conn.prepare('SELECT * FROM [user_challenges] WHERE [guild] = :g AND completed = 0 ORDER BY [id] DESC').all({ g: guildID });
        db.close();
        
        var output = '';
        
        if (challenges.length > 0){
            
            for(var k in challenges){
                
                var record = challenges[k];
                var userObj = lib.getMember(msg, record.user);
                if (userObj){
                    output += `**${userObj.user.username}** : ${record.challenge}\n`;
                }
                
            }
                        
            return msg.embed({
                    color: 3447003,
                    title: '',
                    fields: [
                        {
                            name: lib.get_string(msg.guild.id, 'challenge:active'),
                            value: output
                        }
                    ]                        
		});
            
        } else {
            return msg.say(lib.get_string(msg.guild.id, 'challenge:noactiveserver'));
        }
        
        
    }

    async run(msg, {flag, flag2}) {
                
        // Add guild to waiting array if not already set
        var key = lib.findObjectArrayKeyByKey(this.waiting, 'guild', msg.guild.id);
        if (key === null){
            this.waiting.push({guild: msg.guild.id, users: []});
            key = lib.findObjectArrayKeyByKey(this.waiting, 'guild', msg.guild.id);
        }
        
        flag = flag.toLowerCase();
                        
        // Cancel
        if (flag === 'cancel'){
            return this.run_cancel(msg);
        } else if (flag === 'done'){
            return this.run_complete(msg);
        } else if (flag === 'list'){
            return this.run_list(msg);
        } else {
            return this.run_challenge(msg, flag, flag2);
        }
        
        
    }
};