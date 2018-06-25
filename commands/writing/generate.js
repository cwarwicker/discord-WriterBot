const { Command } = require('discord.js-commando');
const NameGenerator = require('./../../structures/gen.js');

module.exports = class GenerateCommand extends Command {
    constructor(client) {
                
        super(client, {
            name: 'generate',
            aliases: ['gen'],
            group: 'writing',
            memberName: 'generate',
            description: 'Random generator for various things (character names, place names, land names, book titles, writing prompts). Define the type of item you wanted generated and then optionally, the amount of items to generate.',
            examples: ['generate', 'generate char', 'generate place 20', 'generate land', 'generate book', 'generate book_fantasy'],
            args: [
                {
                    key: 'type',
                    prompt: 'What type of name do you want to generate? (char, place, land)',
                    default: 'char',
                    type: 'string'
                },
                {
                    key: 'amount',
                    default: '10',
                    prompt: 'How many names do you want to generate?',
                    type: 'integer',
                    max: '50'
                }
            ]
        });
    }

    run(msg, {type, amount}) {
        
        let generator = new NameGenerator();
        return generator.generate(msg, type, amount);
        
    }
};