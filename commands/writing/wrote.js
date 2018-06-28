const { Command } = require('discord.js-commando');
const Stats = require('./../../structures/stats.js');
const lib = require('./../../lib.js');

module.exports = class EightBallCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'wrote',
            aliases: [],
            group: 'writing',
            memberName: 'wrote',
            description: 'Add to your total words written statistic',
            examples: [
                '`wrote 250` Will add another 250 words to your total words written stat'
            ],
            args: [
                {
                    key: "amount",
                    prompt: "How many words did you write?",
                    type: "integer"
                }
            ]
        });
    }

    run(msg, {amount}) {
        
        var stats = new Stats();
        
        if (!lib.isNumeric(amount) || amount < 1){
            return msg.say('Please enter a valid number, greater than 0');
        }
        
        stats.inc(msg.guild.id, msg.author.id, 'total_words_written', amount);
        var total = stats.get(msg.guild.id, msg.author.id, 'total_words_written');
        return msg.say(`${msg.author}, added ${amount} to their total words written **(${total.value})**`);
        
    }
};