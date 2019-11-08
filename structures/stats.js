const Database = require('./../structures/db.js');
const lib = require('./../lib.js');

class Stats
{
    
    get(guild, user, type){
        
        var db = new Database();
        var record = db.conn.prepare('SELECT * FROM [user_stats] WHERE [guild] = :guild AND [user] = :user AND [name] = :name').get({
            guild: guild,
            user: user,
            name: type
        });
        db.close();
        
        return (record) ? record : false;
        
    }
    
    set(guild, user, type, value){
        
        var db = new Database();
        
        var record = this.get(guild, user, type);
        if (record){
            db.conn.prepare('UPDATE [user_stats] SET [value] = :val WHERE [id] = :id').run({
                val: value,
                id: record.id
            });
        } else {
            db.conn.prepare('INSERT INTO [user_stats] (guild, user, name, value) VALUES (:guild, :user, :name, :val)').run({
                guild: guild,
                user: user,
                name: type,
                val: value
            });
        }
        
        db.close();
        
    }
    
    inc(guild, user, type, increment = 1){
        
        var record = this.get(guild, user, type);
        var value = (record) ? (record.value + increment) : increment;
        this.set(guild, user, type, value);
        
    }
    
    dec(guild, user, type, decrement = 1){
        
        var record = this.get(guild, user, type);
        if (record && record.value > 0){
            this.set(guild, user, type, (record.value - decrement));
        }
        
    }
    
    get_server_total(guild, type){
        
        var db = new Database();
        var record = db.conn.prepare('SELECT SUM(value) as ttl FROM [user_stats] WHERE [guild] = :guild AND [name] = :name').get({
            guild: guild,
            name: type
        });
        db.close();
        
        return (record) ? record.ttl : '-';
        
        
    }
    
    reset_server(guild){
        
        var db = new Database();
        
        // Delete stats
        db.conn.prepare('DELETE FROM [user_stats] WHERE [guild] = :guild COLLATE NOCASE').run({
            guild: guild
        });
        
        // Delete xp/levels
        db.conn.prepare('DELETE FROM [user_xp] WHERE [guild] = :guild COLLATE NOCASE').run({
            guild: guild
        });
        
        // Delete user records
        db.conn.prepare('DELETE FROM [user_records] WHERE [guild] = :guild COLLATE NOCASE').run({
            guild: guild
        });
        
        db.close();
        
        return true; 
        
    }
    
    getTotalActiveSprints(){
        
        var now = Math.floor(new Date() / 1000);
        var db = new Database();
        var record = db.conn.prepare('SELECT COUNT(id) as ttl FROM [sprints] WHERE [end] > :end AND [completed] = 0').get({
            end: now
        });
        db.close();
        
        return (record) ? record.ttl : false;
        
    }
    
}

module.exports = Stats;