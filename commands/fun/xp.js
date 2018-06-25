const { Command } = require('discord.js-commando');
const XP = require('./../../structures/xp.js');


module.exports = class XPCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'xp',
            aliases: ['level'],
            group: 'fun',
            memberName: 'xp',
            description: 'Checks your server Experience Points and Level. Use the "top" flag to see the top 10 on this server.',
            examples: ['xp', 'xp top'],
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
        
        var xp = new XP(msg);
        
        if (who === 'me'){
        
            var user = xp.get(msg.author.id);
            
            if (user){
                var left = xp.calcNextLvl(user.lvl, user.xp);
                var output = `${msg.author}, you are **Level ${user.lvl}** (${user.xp}/${user.xp+left})`;        
                msg.say(output);
            }
        
        } else if (who === 'top'){
            
            var all = xp.guildSettings.xp;
            var show = 10;
            
            // Sort by xp
            all.sort(function(a, b){ 
                return a.xp < b.xp;
            });
            
            
            var output = `\:trophy: LEADERBOARD\n\n`;
            
            for (var i = 0; i < show; i++){
                
                var pos = i + 1;
                var record = all[i];
                
                if (record !== undefined){
                
                    var userObj = msg.guild.members.find('id', record.user);
                    var lvl = xp.calcLvl(record.xp);
                    output += `\`${pos}.\` ${userObj.user.username} - **Level ${lvl}** (${record.xp}xp)\n`;
                
                }
                
            }
            
            msg.say(output);
            
        } 
        
        
    }
};