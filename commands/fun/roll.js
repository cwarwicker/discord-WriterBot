const { Command } = require('discord.js-commando');

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            aliases: ['random', 'dice'],
            group: 'fun',
            memberName: 'roll',
            description: 'Rolls a dice between 1-6, or 1 and a specified number',
            examples: ['roll', 'roll 100'],
            args: [
                {
                    key: 'max',
                    default: '6',
                    prompt: 'Roll between 1 and what number?',
                    type: 'integer'
                }
            ]
        });
    }

    run(msg, {max}) {
        
        // Flip the coin
        var rand = Math.floor(Math.random() * max) + 1;
        return msg.say('You rolled a '+rand+'!');
        
    }
};