const { Command } = require('discord.js-commando');
const util = require('util');
const lib = require('./../../lib.js');

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            aliases: ['dice'],
            group: 'fun',
            memberName: 'roll',
            description: 'Rolls a dice between 1-6, or 1 and a specified number. Can also roll multiple dice at once and get the total.',
            examples: ['`roll` - Rolls one 6-sided die', '`roll d20` - Rolls one 20-sided die', '`roll 8` - Rolls one 8-sided die', '`roll d100 3` - Rolls three 100-sided dice'],
            args: [
                {
                    key: 'max',
                    default: 'd6',
                    prompt: 'Roll what size dice? (`d` + the number of sides, e.g. `d6`, `d10`, `d20`, `d100`, etc...)',
                    type: 'string'
                },
                {
                    key: 'count',
                    default: 1,
                    prompt: 'How many dice do you want to roll?',
                    type: 'integer'
                }
            ]
        });
    }

    run(msg, {max, count}) {
        
        var guildID = (msg.guild !== null) ? msg.guild.id : null;
        
        // Strip the "d" from the beginning of the max, if it exists (it's optional)
        if (max.charAt(0) === 'd' || max.charAt(0) === 'D'){
            max = max.substr(1).trim();
        }
        
        // Max is 255
        if (!lib.isNumeric(max) || max > 255){
            return msg.say( lib.get_string(guildID, 'roll:max:sides') );
        }
                
        // Number of dice can't be less than 1
        if (!lib.isNumeric(count) || count < 1){
            count = 1;
        }
        
        // Max number of dice is 10
        if (count > 50){
            return msg.say( lib.get_string(guildID, 'roll:max:count') );
        }
        
        var total = 0;        
        var output = '';
                
        for(var roll = 1; roll <= count; roll++){
            
            var rand = Math.floor(Math.random() * max) + 1;
            
            // Increment total for the end
            total += rand;
            
            // Output this roll
            output += ' [ '+rand+' ] ';
                        
        }
        
        // If we rolled more than one, put the total at the end
        if (count > 1){
            output += '\n**'+lib.get_string(guildID, 'roll:total')+total+'**';
        }
        
        return msg.say(output);
        
    }
};