const { Command } = require('discord.js-commando');
const reassurances = require('./../../assets/json/reassure.json');

module.exports = class ReassureCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reassure',
            group: 'fun',
            memberName: 'reassure',
            description: 'Gives you reassurance/motivation',
            args: [
                {
                    key: 'user',
                    prompt: 'Who do you want to reassure?',
                    default: msg => msg.author,
                    type: 'user'
                }
            ]
        });
    }

    run(msg, {user}) {
        
        return msg.say(`${user}...${reassurances[Math.floor(Math.random() * reassurances.length)]}`);
        
    }
};