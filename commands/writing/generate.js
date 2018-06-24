const { Command } = require('discord.js-commando');
const reassurances = require('./../../assets/json/reassure.json');
const NameGenerator = require('./../../structures/gen.js');

module.exports = class GenerateCommand extends Command {
    constructor(client) {
                
        super(client, {
            name: 'generate',
            aliases: ['gen'],
            group: 'writing',
            memberName: 'generate',
            description: 'Generates a random fantasy name for a character, place or land. Define the type of name you wanted generated and then optionally, the amount of names to generate (max 50).',
            examples: ['generate', 'generate char', 'generate place', 'generate land', 'generate char 25'],
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