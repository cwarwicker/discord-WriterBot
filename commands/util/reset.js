const { Command } = require('discord.js-commando');
const Record = require('./../../structures/record.js');
const Stats = require('./../../structures/stats.js');
const Goal = require('./../../structures/goal.js');
const XP = require('./../../structures/xp.js');
const lib = require('./../../lib.js');

module.exports = class ProfileCommand extends Command {
	constructor(client) {
		super(client, {
                    name: 'reset',
                    aliases: [],
                    group: 'util',
                    memberName: 'reset',
                    description: 'Reset your server statistics',
                    guildOnly: true,
                    examples: [
                        '`!reset pb`: Resets your wpm personal best on the server', 
                        '`!reset wc`: Resets your total word count on the server', 
                        '`!reset xp`: Resets your xp/level to 0',
                        '`!reset all`: Resets all your stats which can be reset on the server',
                        '`!reset server`: Resets the entire server stats, records and xp/levels`'
                    ],
                    args: [
                        {
                            key: 'what',
                            prompt: 'What do you want to reset? Words-per-minute PB: `pb`, Total Word Count: `wc`, or your entire profile: `all`',
                            type: 'string'
                        },
                        {
                            key: 'confirm',
                            prompt: 'Are you sure you want to do that? (yes/no)',
                            type: 'string',
                            default: ''
                        }
                    ]
		});
                                
	}

	run(msg, {what, confirm}) {
            
            var guildID = msg.guild.id;
            var userID = msg.author.id;
            
            var stats = new Stats();
            var record = new Record();
            
            confirm = confirm.toLowerCase();
            
            if (what === 'pb'){
                
                record.set(guildID, userID, 'wpm', 0);
                return msg.say(`${msg.author}, ${lib.get_string(msg.guild.id, 'reset:pb')}`);
                
            } else if (what === 'wc'){
                
                stats.set(guildID, userID, 'total_words_written', 0);
                return msg.say(`${msg.author}, ${lib.get_string(msg.guild.id, 'reset:wc')}`);
                
            } else if(what === 'xp') {
             
                var xp = new XP(guildID, userID, msg);
                xp.reset();
                return msg.say(`${msg.author}, ${lib.get_string(msg.guild.id, 'reset:xp')}`);
            
            } else if(what === 'all'){
                
                // wpm pb
                record.set(guildID, userID, 'wpm', 0);
                
                // Stats
                stats.set(guildID, userID, 'total_words_written', 0);
                stats.set(guildID, userID, 'sprints_words_written', 0);
                stats.set(guildID, userID, 'sprints_completed', 0);
                stats.set(guildID, userID, 'sprints_won', 0);
                stats.set(guildID, userID, 'sprints_started', 0);
                stats.set(guildID, userID, 'challenges_completed', 0);
                stats.set(guildID, userID, 'daily_goals_completed', 0);
                
                var goal = new Goal(msg, msg.guild.id, msg.author.id);
                goal.delete('daily');
                
                var xp = new XP(guildID, userID, msg);
                xp.reset();
                
                return msg.say(`${msg.author}, ${lib.get_string(msg.guild.id, 'reset:done')}`);
                                
            } else if (what === 'server'){
                
                // Are you a server mod/admin?
                if (!msg.member.hasPermission('MANAGE_MESSAGES')){
                    return msg.say( lib.get_string(msg.guild.id, 'err:permissions') );
                }
                
                if (confirm === 'yes'){
                    stats.reset_server(guildID);
                    return msg.say( lib.get_string(msg.guild.id, 'reset:server') );
                } else {
                    return msg.say( lib.get_string(msg.guild.id, 'reset:server:sure') );
                }                
                
            } else {
                return msg.say(lib.get_string(msg.guild.id, 'reset:invalid') + ': `pb`, `wc`, `all`');
            }
            
            
            
            
	}
};