const Database = require('./../structures/db.js');
const Stats = require('./stats.js');
const XP = require('./xp.js');
const lib = require('./../lib.js');

class Goal
{
    
    constructor(msg, guildID, userID)
    {
        
        this.msg = msg;
        this.guildID = guildID;
        this.userID = userID;
        
    }
    
    get(type)
    {
        
        var db = new Database();
        var record = db.conn.prepare('SELECT * FROM [user_goals] WHERE [guild] = :guild AND [user] = :user AND [type] = :type').get({
            guild: this.guildID,
            user: this.userID,
            type: type
        });
        db.close();
        
        return (record) ? record : false;
        
    }
    
    set(type, goal)
    {
        
        var date = new Date();
        
        // Daily
        if (type === 'daily'){
            
            date.setUTCHours(0, 0, 0, 0);
            var reset = 60 * 60 * 24;
            var lastreset = (date / 1000) - 60; // Give ourselves 60 seconds in case running slow
            
        } else {
            return false;
        }
        
        
        var db = new Database();
        
        // Is there one already?
        var record = this.get(type);
        if (record){
            
            db.conn.prepare('UPDATE [user_goals] SET [goal] = :goal WHERE [id] = :id').run({
                goal: goal,
                id: record.id
            });
            
        } else {
            
            db.conn.prepare('INSERT INTO [user_goals] (guild, user, type, goal, current, completed, reset, lastreset) VALUES (:guild, :user, :type, :goal, :current, :completed, :reset, :lastreset)').run({
                guild: this.guildID,
                user: this.userID,
                type: type,
                goal: goal,
                current: 0,
                completed: 0,
                reset: reset,
                lastreset: lastreset
            });
            
        }
        
        db.close();
        
        return true;
        
    }
    
    add(type, amount)
    {
       
        if (!lib.isNumeric(amount)){
            return false;
        }
        
        var record = this.get(type);
        
        if (record){
            
            var db = new Database();
            
            var newAmount = record.current + amount;
            if (newAmount < 0){
                newAmount = 0;
            }
            
            var alreadyCompleted = record.completed;
            var completed = record.completed;
            
            // Only set completed to 1 if it is currently 0, and if the new amount meets the goal
            if (!alreadyCompleted && newAmount >= record.goal){
                completed = 1;
            }
            
            db.conn.prepare('UPDATE [user_goals] SET [current] = :current, [completed] = :completed WHERE [id] = :id').run({
                current: newAmount,
                completed: completed,
                id: record.id
            });
            
            db.close();
            
            // Did we complete it?
            if (!alreadyCompleted && completed){
                
                var stat = type + '_goals_completed';
                var stats = new Stats();
                stats.inc(this.guildID, this.userID, stat, 1);
                
                var xp = new XP(this.guildID, this.userID, this.msg);
                xp.add(xp.XP_COMPLETE_GOAL[type]);
                
                this.msg.say(`<@${this.userID}> met their ${type} goal of ${record.goal} words!     +${xp.XP_COMPLETE_GOAL[type]}xp`);
                
            }
            
            return true;
            
        } 
        
        return false;
                
    }
    
    delete(type)
    {
        
        var record = this.get(type);
        if (record){
            
            var db = new Database();
            db.conn.prepare('DELETE FROM [user_goals] WHERE [id] = :id').run({
                id: record.id
            });
            db.close();
                        
        }
        
        return true;
        
    }
    
    // Increment all active goals by amount written
    inc(amount)
    {
        
        this.add('daily', amount);
        
    }    
    
    // Run the 00:00 resets
    reset()
    {
        
        var db = new Database();
        
        var date = new Date();
        var now = Math.floor(date / 1000);  
        
        var cnt = 0;
        
        var all = db.conn.prepare('SELECT * FROM [user_goals]').all();
                
        for (var i = 0; i < all.length; i++)
        {
            
            var record = all[i];
            var diff = now - record.lastreset;
                        
            if (diff >= record.reset){
                
                db.conn.prepare('UPDATE [user_goals] SET [current] = 0, [completed] = 0, [lastreset] = :last WHERE [id] = :id').run({
                    last: now,
                    id: record.id
                });
                
                cnt++;
                
            }
            
            
        }
        
        db.close();
        
        console.log('['+date+'] Reset ' + cnt + ' goals');
        
    }
    
}

module.exports = Goal;