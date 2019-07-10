const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');
const Stats = require('./../../structures/stats.js');

module.exports = class PromptCommand extends Command {
    constructor(client) {
        
        super(client, {
            name: 'prompt',
            aliases: [],
            group: 'writing',
            memberName: 'prompt',
            description: 'Generates a random writing prompt. Initial prompts taken from (thewritersacademy and /r/writingprompts)',
            examples: [
                '`prompt` Generates a random writing prompt'
            ]
        });
                
    }

    run(msg) {
        
        var guildID = (msg.guild !== null) ? msg.guild.id : null;
        var prompts = lib.get_asset(guildID, 'prompts.json');

        // Updated stat
        if (guildID !== null){
            var stats = new Stats();
            stats.inc(guildID, msg.author.id, 'writing_prompts_generated', 1);
        }
        
        var rand = Math.floor(Math.random() * prompts.prompts.length);
        return msg.say(`[${rand + 1}] ${prompts.prompts[rand]}`);
        
    }
};