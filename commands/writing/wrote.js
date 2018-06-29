const { Command } = require('discord.js-commando');
const Stats = require('./../../structures/stats.js');
const XP = require('./../../structures/xp.js');
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
        
        this.XP_PER = 500;
        
    }

    run(msg, {amount}) {
        
        var stats = new Stats();
        var xp = new XP(msg.guild.id, msg.author.id, msg);
        
        if (!lib.isNumeric(amount) || amount < 1){
            return msg.say('Please enter a valid number, greater than 0.');
        }
        
        // Increment their words written stat
        stats.inc(msg.guild.id, msg.author.id, 'total_words_written', amount);
        
        // Get their new total
        var total = stats.get(msg.guild.id, msg.author.id, 'total_words_written');
        
        // At what wordcount did they last get some xp from writing?
        var lastStat = stats.get(msg.guild.id, msg.author.id, 'last_writing_xpup');
        var last = (lastStat) ? lastStat.value : 0;
        var diff = total.value - last;
        var exp = 0;
        
        if (diff > this.XP_PER){
            var times = Math.floor(diff / this.XP_PER);
            exp = (times * xp.XP_PER_500_WORDS);
            xp.add(exp);
            stats.set(msg.guild.id, msg.author.id, 'last_writing_xpup', total.value);
        }
        
        var output = `${msg.author}, added ${amount} to their total words written **(${total.value})**`;
        if (exp > 0){
            output += `     +${exp}xp`;
        }
        
        return msg.say(output);
        
    }
};