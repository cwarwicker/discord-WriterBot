const Data = require('./data.js');
const lib = require('./../lib.js');

class XP
{
    
    constructor(msg)
    {
        
        // Exp amounts
        this.XP_COMPLETE_SPRINT = 10;
        this.XP_WIN_SPRINT = 100;
        
        this.msg = msg;
        this.data = new Data(msg.guild);
        this.guildSettings = this.data.g();
        
        // Create xp object, if there isn't one
        if (this.guildSettings.xp === undefined){
            this.guildSettings.xp = [];
        } 
        
        
        
    }
    
    find(id){
        
        // Check if you are already in the sprint
        var userArray = this.guildSettings.xp;

        var index = userArray.findIndex(function(i){
            return (i.user == id);
        });
        
        return (index >= 0) ? userArray[index] : false;
        
    }
    
    get(id){
        
        var user = this.find(id);
        if (user){
            return {xp: user.xp, lvl: this.calcLvl(user.xp)};
        } else {
            return false;
        }
        
    }
    
    calcLvl(xp){
        return Math.ceil(xp / 100);
    }
    
    calcNextLvl(lvl, xp){
        return ((lvl * 100)+1) - xp;
    }
    
    add(usr, exp){
        
        // Find the user in the guildSettings
        var userXP = this.find(usr);
        
        // If not there, add a record
        if (!userXP){
            userXP = {user: usr, xp: 0};
            this.guildSettings.xp.push(userXP);
        }
        
        // Current level
        var curLvl = this.calcLvl(userXP.xp);
        
        // Add amount
        if (!lib.isInt(exp) || exp < 0){
            exp = 0;
        }
        
        userXP.xp += exp;
                
        // Update settings
        this.data.s(this.guildSettings);
        
        // New level
        var newLvl = this.calcLvl(userXP.xp);
        
        // If gone up, display a message
        if (newLvl > curLvl && curLvl > 0){
            this.msg.say(`\:tada: Congratulations <@${usr}>, you are now **Level ${newLvl}**`);
        }
        
        
    }
    
    
    
}

module.exports = XP;
