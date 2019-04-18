const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');

module.exports = class FlipCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'flip',
            aliases: ['coin'],
            group: 'fun',
            memberName: 'flip',
            description: 'Flips a coin',
            examples: [
                '`flip`'
            ]
        });
                
    }

    run(msg) {
        
        // Flip the coin
        var rand = Math.floor(Math.random() * 2) + 1;
                
        if (rand === 1){
            return msg.say( lib.get_string(msg.guild.id, 'flip:heads') );
        } else {
            return msg.say( lib.get_string(msg.guild.id, 'flip:tails') );
        }
        
    }
};