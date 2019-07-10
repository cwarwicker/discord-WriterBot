const Database = require('./../structures/db.js');
const lib = require('./../lib.js');

class UserSetting
{
    
    get(userID, setting){
        
        var db = new Database();
        var record = db.conn.prepare('SELECT * FROM [user_settings] WHERE [user] = :user AND [setting] = :setting').get({
            user: userID,
            setting: setting
        });
        db.close();
        
        return (record) ? record : false;
        
    }
    
    set(userID, setting, value){
        
        var db = new Database();
        
        var record = this.get(userID, setting);
        if (record){
            db.conn.prepare('UPDATE [user_settings] SET [value] = :val WHERE [id] = :id').run({
                val: value,
                id: record.id
            });
        } else {
            db.conn.prepare('INSERT INTO [user_settings] (user, setting, value) VALUES (:user, :setting, :val)').run({
                user: userID,
                setting: setting,
                val: value
            });
        }
        
        db.close();
        
    }
    
}

module.exports = UserSetting;