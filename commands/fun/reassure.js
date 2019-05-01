const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');


module.exports = class ReassureCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reassure',
            group: 'fun',
            memberName: 'reassure',
            description: 'Gives you reassurance/motivation',
            examples: [
                '`reassure`'
            ],
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
        
        var guildID = (msg.guild !== null) ? msg.guild.id : null;
        var reassurances = lib.get_asset(guildID, 'reassure.json');

        return msg.say(`${user}, ${reassurances[Math.floor(Math.random() * reassurances.length)]}`);
        
    }
};