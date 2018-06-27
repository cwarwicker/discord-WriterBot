const { Command } = require('discord.js-commando');
const Data = require('./../../structures/data.js');
const XP = require('./../../structures/xp.js');
const lib = require('./../../lib.js');

module.exports = class ChallengeCommand extends Command {
    constructor(client) {
                
        super(client, {
            name: 'challenge',
            aliases: [],
            group: 'writing',
            memberName: 'challenge',
            description: 'Generates a random writing challenge for you. e.g. "Write 400 words in 15 minutes". You can add the flags "easy", "normal", "hard", "hardcore", or "insane" to choose a pre-set wpm, or add your chosen wpm as the flag, or you can specify a time instead by adding a the time in minutes, prefixed with a "t", e.g. "t15"',
            examples: [
                '`challenge` - Generates a random writing challenge', 
                '`challenge cancel` - Cancels your current challenge', 
                '`challenge done` - Completes your current challenge', 
                '`challenge easy` - Generates a random writing challenge, at 5 wpm', 
                '`challenge normal` - Generates a random writing challenge, at 10 wpm', 
                '`challenge hard` - Generates a random writing challenge, at 20 wpm', 
                '`challenge hardcore` - Generates a random writing challenge, at 40 wpm', 
                '`challenge insane` - Generates a random writing challenge, at 60 wpm', 
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
        this.guildSettings = [];
        this.waiting = [];
        
    }

    has_challenge(id){
        
        return (this.get_challenge() !== false);
        
    }


    get_challenge(id){
        
        // Check if the user already has a pending challenge
        var userArray = this.guildSettings.challenges;

        var index = userArray.findIndex(function(i){
            return (i.user == id);
        });
        
        return (index >= 0) ? userArray[index] : false;
        
    }
    
    set_challenge(msg, usr, challenge){
        
        var userChallenge = this.get_challenge(usr);
        if (!userChallenge){
            
            this.guildSettings.challenges.push({user: usr, challenge: challenge});
            this.data.s(this.guildSettings);
            
        } else {
            msg.say('You do not have a current challenge. Perhaps you should start one? `challenge`');
        }
        
    }
    
    run_complete(msg, userChallenge){
        
        if (userChallenge){
            
            // Remove the challenge
            var userArray = this.guildSettings.challenges;
            
            userArray.splice(userArray.findIndex(function(i){
                return (i.user == msg.author.id);
            }), 1);

            // Update settings
            this.guildSettings.sprint.challenges = userArray;
            
            // Update xp
            var xp = new XP(msg);
            xp.add(msg.author.id, xp.XP_COMPLETE_CHALLENGE);
            
            // Save
            this.data.s(this.guildSettings);
            
            msg.say(`${msg.author} has completed the challenge **${userChallenge.challenge}**     +${xp.XP_COMPLETE_CHALLENGE} xp`);
            
            
        } else {
            msg.say('You do not have a current challenge. Perhaps you should start one? `challenge`');
        }
        
    }
    
    run_cancel(msg, userChallenge){
        
        if (userChallenge){
            
            // Remove the challenge
            var userArray = this.guildSettings.challenges;
            
            userArray.splice(userArray.findIndex(function(i){
                return (i.user == msg.author.id);
            }), 1);

            // Update settings
            this.guildSettings.challenges = userArray;
            this.data.s(this.guildSettings);
            
            msg.say('Challenge cancelled.');
            
        } else {
            msg.say('You do not have a current challenge.');
        }
        
    }
    
    run_challenge(msg, userChallenge, flag, flag2){
                
        if (!userChallenge){

            var wait = this.waiting.indexOf(msg.author.id);
            if (wait >= 0){
                msg.say('Please respond with either `yes` or `no` to your current challenge.');
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

            // Round it down to a neater number
            goal = Math.round(goal / 10) * 10;

            var challenge = `Write at least ${goal} words, in ${time} minutes (${wpm} wpm)`;

            msg.say(`${msg.author}, Your challenge is to: ${challenge}. Will you accept this challenge? \`yes\` or \`no\` (You have 30 seconds to decide)`);
            
            this.waiting.push(msg.author.id);
            wait = this.waiting.indexOf(msg.author.id);

            var check = msg.channel.awaitMessages( m => ( (m.author.id == msg.author.id) && (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'no') ), {
                max: 1,
                time: 30000,
                errors: ['time']
            } ).then(mg => {

                var answer = mg.first().content;
                if (answer === 'yes'){

                    this.set_challenge(msg, msg.author.id, challenge);
                    msg.say(`${msg.author}, Challenge accepted: **${challenge}**\n\`challenge done\` to complete the challenge.\n\`challenge cancel\` to cancel the challenge.`);

                } else {
                    msg.say(`${msg.author}, Challenge declined`);
                }
                
                // Remove waiting
                delete this.waiting[wait];
                
            }).catch((err) => {
                // Remove waiting
                delete this.waiting[wait];
            });
        
        } else {
            
            msg.say(`${msg.author}, your current challenge is: **${userChallenge.challenge}**\n\`challenge done\` to complete the challenge.\n\`challenge cancel\` to cancel the challenge.`);
            
        }
        
    }
    
    run_list(msg){
        
        var challenges = this.guildSettings.challenges;
        var output = '';
        
        if (challenges.length > 0){
            
            for(var k in challenges){
                
                var record = challenges[k];
                var userObj = lib.getMember(msg, record.user);
                if (userObj){
                    output += `**${userObj.user.username}** : ${record.challenge}\n`;
                }
                
            }
            
            msg.say('**Active Challenges:**\n\n' + output);
            
        } else {
            msg.say('There are no active challenges on this server.');
        }
        
        
    }

    async run(msg, {flag, flag2}) {
        
        this.data = new Data(msg.guild);
        this.guildSettings = this.data.g();
        
        // Create challenges object, if there isn't one
        if (this.guildSettings.challenges === undefined){
            this.guildSettings.challenges = [];
        }  
        
        var userChallenge = this.get_challenge(msg.author.id);
        
        // Cancel
        if (flag === 'cancel'){
            this.run_cancel(msg, userChallenge);
        } else if (flag === 'done'){
            this.run_complete(msg, userChallenge);
        } else if (flag === 'list'){
            this.run_list(msg);
        } else {
            this.run_challenge(msg, userChallenge, flag, flag2);
        }
        
        
        
        
        
        
    }
};