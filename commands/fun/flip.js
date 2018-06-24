const { Command } = require('discord.js-commando');

module.exports = class FlipCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'flip',
            aliases: ['coin'],
            group: 'fun',
            memberName: 'flip',
            description: 'Flips a coin'
        });
    }

    run(msg) {
        
        // Flip the coin
        var rand = Math.floor(Math.random() * 2) + 1;
        
        if (rand === 1){
            return msg.say('It landed on heads!');
        } else {
            return msg.say('It landed on tails!');
        }
        
    }
};