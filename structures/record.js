const Database = require('./../structures/db.js');
const lib = require('./../lib.js');

class Record
{
    
    get(guild, user, type){
        
        var db = new Database();
        var record = db.conn.prepare('SELECT * FROM [user_records] WHERE [guild] = :guild AND [user] = :user AND [record] = :record').get({
            guild: guild,
            user: user,
            record: type
        });
        db.close();
        
        return (record) ? record : false;
        
    }
    
    set(guild, user, type, value){
        
        var db = new Database();
        
        var record = this.get(guild, user, type);
        if (record){
            db.conn.prepare('UPDATE [user_records] SET [value] = :val WHERE [id] = :id').run({
                val: value,
                id: record.id
            });
        } else {
            db.conn.prepare('INSERT INTO [user_records] (guild, user, record, value) VALUES (:guild, :user, :record, :val)').run({
                guild: guild,
                user: user,
                record: type,
                val: value
            });
        }
        
        db.close();
        
    }
    
}

module.exports = Record;