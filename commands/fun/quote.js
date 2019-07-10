const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');

module.exports = class QuoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'quote',
            group: 'fun',
            memberName: 'quote',
            description: 'Gives you random motivational quote',
            examples: [
                '`quote`'
            ]
        });
    }

    run(msg, {user}) {
        
        var guildID = (msg.guild !== null) ? msg.guild.id : null;
        var quotes = lib.get_asset(guildID, 'quotes.json');

        var quote = quotes[Math.floor(Math.random() * quotes.length)];
        return msg.say(quote.quote + ' - *'+quote.name+'*');
        
    }
};