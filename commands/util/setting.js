const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');

const Setting = require('./../../structures/settings.js');

module.exports = class SettingCommand extends Command {
	constructor(client) {
            
            super(client, {
                name: 'set',
                aliases: [],
                group: 'util',
                memberName: 'set',
                description: 'Update a server setting',
                guildOnly: true,
                userPermissions: ['MANAGE_MESSAGES'],
                examples: [
                            '`!set lang <language>`: Set the language to be used. Available languages currently: `en`',
                            '`!set sprint_delay_end <minutes>`: Set the timer delay between the sprint finishing and the final wordcounts being tallied. Maximum value is: `15`. Default value is: `2`',
                          ],
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
                
            this.acceptedSettings = new Array(
                    'lang',
                    'sprint_delay_end'
            );    
                                
	}
        
	run(msg, {setting, value}) {
            
            var guildID = msg.guild.id;           
            var settings = new Setting();
            
            if (this.acceptedSettings.indexOf(setting) < 0){
                return msg.say( lib.get_string(guildID, 'err:invalidsetting') );
            }
            
            settings.set(guildID, setting, value);
            return msg.say(`${msg.author} ${lib.get_string(guildID, 'setting:updated')} \`${setting}\` to \`${value}\``);    
            
	}
};