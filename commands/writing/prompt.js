const { Command } = require('discord.js-commando');
const Stats = require('./../../structures/stats.js');
const prompts = require('./../../assets/json/prompts.json');

module.exports = class PromptCommand extends Command {
    constructor(client) {
        
        super(client, {
            name: 'prompt',
            aliases: [],
            group: 'writing',
            memberName: 'prompt',
            description: 'Generates a random writing prompt',
            examples: [
                '`prompt` Generates a random writing prompt'
            ]
        });
                
    }

    run(msg) {
        
        // Updated stat
        var stats = new Stats();
        stats.inc(msg.guild.id, msg.author.id, 'writing_prompts_generated', 1);
        
        var rand = Math.floor(Math.random() * prompts.prompts.length);
        
        return msg.say(`[${rand + 1}] ${prompts.prompts[rand]}`);
        
    }
};