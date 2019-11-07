const Database = require('./../structures/db.js');
const lib = require('./../lib.js');

class XP
{
    
    constructor(guild, user, msg)
    {
        
        // Exp amounts
        this.XP_COMPLETE_SPRINT = 25;
        this.XP_WIN_SPRINT = 100;
        this.XP_COMPLETE_GOAL = {
            'daily': 100
        };
        
        this.guild = guild;
        this.user = user;
        this.msg = msg;
        
        this.load();
        
    }
    
    load(){
        
        var db = new Database();
        
        var record = db.conn.prepare('SELECT * FROM [user_xp] WHERE [guild] = ? AND [user] = ?').get([this.guild, this.user]);
        
        // Insert if doesn't exist
        if (record == undefined){
            
            db.conn.prepare('INSERT INTO [user_xp] (guild, user) VALUES (:g, :u)').run({
                g: this.guild,
                u: this.user
            });
            
            record = db.conn.prepare('SELECT * FROM [user_xp] WHERE [guild] = ? AND [user] = ?').get([this.guild, this.user]);
            
        }
        
        this.record = record;
        
        db.close();

    }
    
    
    get(){
        
        if (this.record !== undefined){
            return {xp: this.record.xp, lvl: this.calcLvl(this.record.xp)};
        } else {
            return false;
        }
        
    }
    
    all(){
        
        var db = new Database();
        var records = db.conn.prepare('SELECT * FROM [user_xp] WHERE [guild] = :guild ORDER BY xp DESC LIMIT 10').all({
            guild: this.guild
        });
        db.close();
        
        return records;
        
    }
    
    calcLvl(xp){
        return Math.ceil(xp / 100);
    }
    
    calcNextLvl(lvl, xp){
        return ((lvl * 100)+1) - xp;
    }
    
    add(exp){
        
        if (this.record !== undefined){
            
            // Current level
            var curLvl = this.calcLvl(this.record.xp);

            // Add amount
            if (!lib.isInt(exp) || exp < 0){
                exp = 0;
            }

            var newExp = this.record.xp + exp;

            // Update
            var db = new Database();
            db.conn.prepare('UPDATE [user_xp] SET [xp] = :xp WHERE id = :id').run({
                xp: newExp,
                id: this.record.id
            });
            db.close();
            
            // Load new record
            this.load();

            // New level
            var newLvl = this.calcLvl(newExp);

            // If gone up, display a message
            if (newLvl > curLvl && curLvl > 0){
                this.msg.say(`\:tada: Congratulations <@${this.user}>, you are now **Level ${newLvl}**`);
            }
        
        }
        
        
    }
    
    reset() {
        
        var db = new Database();
        db.conn.prepare('UPDATE [user_xp] SET [xp] = 0 WHERE [guild] = :guild AND [user] = :user').run({
            guild: this.guild,
            user: this.user
        });
        db.close();
        
        return true;
        
    }
    
    
}

module.exports = XP;
