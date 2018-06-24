const { Command } = require('discord.js-commando');

module.exports = class ChallengeCommand extends Command {
    constructor(client) {
                
        super(client, {
            name: 'challenge',
            aliases: [],
            group: 'writing',
            memberName: 'challenge',
            description: 'Generates a random writing challenge for you. e.g. "Write 400 words in 15 minutes".',
            examples: ['challenge']
        });
        
        this.wpm = {min: 20, max: 60};
        this.times = {min: 5, max: 60};
        
    }

    async run(msg, {type, amount}) {
        
        var wpm = Math.floor(Math.random()*(this.wpm.max - this.wpm.min + 1) + this.wpm.min);
        var time = Math.floor(Math.random()*(this.times.max - this.times.min + 1) + this.times.min);
        var goal = wpm * time;
        
        // Round it down to a neater number
        goal = Math.round(goal / 10) * 10;
        
        msg.say(`${msg.author}, Your challenge - if you choose to accept it - is to write at least ${goal} words, in ${time} minutes (${wpm} wpm). Will you accept this challenge? \`yes\` or \`no\` (You have 30 seconds to decide)`);
        
        var check = msg.channel.awaitMessages( m => ( (m.author.id == msg.author.id) && (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'no') ), {
            max: 1,
            time: 30000,
            errors: ['time']
        } ).then(mg => {
            
            var answer = mg.first().content;
            if (answer === 'yes'){
                msg.say('\:muscle: **Challenge Accepted!**');
            } else {
                msg.say('**Challenge declined**');
            }
            
        }).catch((err) => {
            
        });
        
        console.log(check);
        
    }
};