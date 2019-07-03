const Database = require('./../../structures/db.js');

class Update
{
    
    constructor()
    {
        
        var db = new Database();
        var record = db.conn.prepare('SELECT * FROM [bot_settings] WHERE [setting] = :setting').get({
            setting: 'version'
        });
        
        db.close();
        
        this.version = (record) ? record.value : 0;
        
    }
    
    log(version, txt)
    {
        console.log('[UPDATE]['+version+'] ' + txt);
    }
    
    run(version)
    {
        
        var db = new Database();
        
        // Start transaction
        db.conn.prepare('BEGIN');
        
        if (this.version < 201907031){
            
            // Add xp column to user_challenges
            db.conn.prepare('ALTER TABLE [user_challenges] ADD COLUMN [xp] int').run();
            this.log(version, 'Added [xp] column to [user_challenges] table');
            
        }
        
        
        
        
        // End transaction
        db.conn.prepare('COMMIT');
        
        // Finished
        // 
        // Set new version in DB
        if (this.version == 0){
            
            db.conn.prepare('INSERT INTO [bot_settings] (setting, value) VALUES (:setting, :val)').run({
                val: version,
                setting: 'version'
            });
            
        } else {
            
            db.conn.prepare('UPDATE [bot_settings] SET [value] = :val WHERE [setting] = :setting').run({
                val: version,
                setting: 'version'
            });
            
        }
        
        db.close();
        
    }
    
}

module.exports = Update;