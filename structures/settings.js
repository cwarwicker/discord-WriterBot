const Database = require('./../structures/db.js');
const lib = require('./../lib.js');

class Setting
{
    
    get(guild, setting){
        
        var db = new Database();
        var record = db.conn.prepare('SELECT * FROM [guild_settings] WHERE [guild] = :guild AND [setting] = :setting').get({
            guild: guild,
            setting: setting
        });
        db.close();
        
        return (record) ? record : false;
        
    }
    
    set(guild, setting, value){
        
        var db = new Database();
        
        var record = this.get(guild, setting);
        if (record){
            db.conn.prepare('UPDATE [guild_settings] SET [value] = :val WHERE [id] = :id').run({
                val: value,
                id: record.id
            });
        } else {
            db.conn.prepare('INSERT INTO [guild_settings] (guild, setting, value) VALUES (:guild, :setting, :val)').run({
                guild: guild,
                setting: setting,
                val: value
            });
        }
        
        db.close();
        
    }
    
}

module.exports = Setting;