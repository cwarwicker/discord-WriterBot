const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');

const XP = require('./../../structures/xp.js');

module.exports = class XPCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'xp',
            aliases: ['level'],
            group: 'fun',
            memberName: 'xp',
            description: 'Checks your server Experience Points and Level. Use the "top" flag to see the top 10 on this server.',
            guildOnly: true,
            examples: ['`xp` Shows your level/xp', '`xp top` Shows the top 10 users on the server'],
            args: [
                {
                    key: 'who',
                    default: 'me',
                    prompt: '',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, {who}) {
        
        var xp = new XP(msg.guild.id, msg.author.id, msg);
        who = who.toLowerCase();        
        
        if (who === 'me'){
        
            var user = xp.get();
            
            if (user && user.xp > 0){
                var left = xp.calcNextLvl(user.lvl, user.xp);
                var output = `${msg.author}: ${lib.get_string(msg.guild.id, 'youare')} **${lib.get_string(msg.guild.id, 'level')} ${user.lvl}** (${user.xp}/${user.xp+left})`;        
                msg.say(output);
            } else {
                msg.say(`${msg.author}: ${lib.get_string(msg.guild.id, 'xp:noxp')}`);
            }
        
        } else if (who === 'top'){
            
            var all = xp.all();

            var output = `\:trophy: **${lib.get_string(msg.guild.id, 'xp:leaderboard')}**\n\n`;
            
            for (var i = 0; i < all.length; i++){
                
                var row = all[i];
                var userObj = msg.guild.members.find('id', row.user);
                if (userObj){
                    var lvl = xp.calcLvl(row.xp);
                    output += `\`${i+1}.\` ${userObj.user.username} - **${lib.get_string(msg.guild.id, 'level')} ${lvl}** (${row.xp})\n`;
                }
                
            }

            msg.say(output);
            
        } 
        
        
    }
};