const { Command } = require('discord.js-commando');
const util = require('util');
const lib = require('./../../lib.js');
const moment = require('moment-timezone');

const UserSetting = require('./../../structures/user_settings.js');

module.exports = class MySettingCommand extends Command {
	constructor(client) {
            
            super(client, {
                name: 'myset',
                aliases: [],
                group: 'util',
                memberName: 'myset',
                description: 'Update a user setting',
                guildOnly: true,
                examples: [
                            '`!myset timezone timezone`: Set your current timezone. E.g. `!myset timezone Europe/London`. **Make sure you use a valid TZ Database Name, from this list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones**',
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
                        type: 'string',
                        default: ''
                    }
                ]
            });
                
            this.acceptedSettings = new Array(
                'timezone'
            );    
                                
	}
        
	run(msg, {setting, value}) {
            
            var guildID = msg.guild.id;
            var userID = msg.author.id;
            var userSetting = new UserSetting();
            
            value = value.trim();
            
            if (this.acceptedSettings.indexOf(setting) < 0){
                return msg.say( lib.get_string(guildID, 'err:invalidsetting') );
            }
            
            // Time - Calculate and set the actual setting value
            if (setting === 'timezone'){
                
                // If they didn't enter a value yet, reply with the wikipedia link for info
                if (value === ''){
                    return msg.say( lib.get_string(guildID, 'mysetting:timezone:help') );
                }
                
                var timezone = value;
                var userTime = moment.tz(timezone);
                var offset = userTime.utcOffset();
                var offsetString = (offset >= 0) ? '+' + offset : offset;
                
                msg.say( util.format( lib.get_string(guildID, 'event:timezoneupdated'), timezone, userTime.format('LLLL'), offsetString ) );
                                                
            }
            
            userSetting.set(userID, setting, value);
            return msg.say(`${msg.author} ${lib.get_string(guildID, 'mysetting:updated')} \`${setting}\` to \`${value}\``);    
            
	}
};