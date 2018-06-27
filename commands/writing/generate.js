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
            examples: [
                '`generate char` Generates 10 character names', 
                '`generate place 20` Generates 20 fantasy place names', 
                '`generate land` Generates 10 fantasy land/world names',
                '`generate book` Generates 10 general fiction book titles', 
                '`generate book_fantasy` Generates 10 fantasy book titles', 
                '`generate book_sf` Generates 10 sci-fi book titles', 
                '`generate book_hp` Generates 10 Harry Potter book titles'
            ],
            args: [
                {
                    key: 'type',
                    prompt: 'What type of name do you want to generate? (char, place, land, book, book_fantasy, book_sf, book_hp, prompt)',
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