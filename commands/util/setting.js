const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');

const Setting = require('./../../structures/settings.js');

module.exports = class ProfileCommand extends Command {
	constructor(client) {
		super(client, {
                    name: 'set',
                    aliases: [],
                    group: 'util',
                    memberName: 'set',
                    description: 'Update a server setting',
                    guildOnly: true,
                    userPermissions: ['MANAGE_MESSAGES'],
                    examples: ['`!set lang <language>`: Set the language to be used. Available languages currently: `en`'],
                    args: [
                        {
                            key: 'setting',
                            prompt: 'Which setting do you want to update?',
                            type: 'string'
                        },
                        {
                            key: 'value',
                            prompt: 'What value are you setting?',
                            type: 'string'
                        }
                    ]
		});
                                
	}
        
	run(msg, {setting, value}) {
            
            var guildID = msg.guild.id;           
            var settings = new Setting();
            
            settings.set(guildID, setting, value);
            return msg.say(`${msg.author} ${lib.get_string(guildID, 'setting:updated')} \`${setting}\`to \`${value}\``);    
            
	}
};