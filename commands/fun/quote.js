const { Command } = require('discord.js-commando');
const quotes = require('./../../assets/json/quotes.json');

module.exports = class QuoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'quote',
            group: 'fun',
            memberName: 'quote',
            description: 'Gives you random motivational quote'
        });
    }

    run(msg, {user}) {
        
        var quote = quotes[Math.floor(Math.random() * quotes.length)];
        return msg.say(quote.quote + ' - *'+quote.name+'*');
        
    }
};