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
        
        this.oldVersion = (record) ? record.value : 0;
        
    }
    
    log(version, txt)
    {
        console.log('[UPDATE]['+version+'] ' + txt);
    }
    
    run(version)
    {
        
        var db = new Database();
              
        if (this.oldVersion > 0){

            // Start transaction
            db.conn.prepare('BEGIN');

            if (this.oldVersion < 201907031){

                // Add xp column to user_challenges
                db.conn.prepare('ALTER TABLE [user_challenges] ADD COLUMN [xp] int').run();
                this.log(version, 'Added [xp] column to [user_challenges] table');

            }

            // Add current_wc column to [sprint_users]
            if (this.oldVersion < 201907042){

                db.conn.prepare('ALTER TABLE [sprint_users] ADD COLUMN [current_wc] INTEGER DEFAULT 0').run();
                this.log(version, 'Added [current_wc] column to [sprint_users] table');

            }


            // Add [event] column to [sprint_users] so they can declare an event they wrote for
            if (this.oldVersion < 201907043){
                db.conn.prepare('ALTER TABLE [sprint_users] ADD COLUMN [event] INTEGER DEFAULT 0').run();
                this.log(version, 'Added [event] column to [sprint_users] table');
            }
           
            // Add timejoined column to sprint_users table
            if (this.oldVersion < 201911051){
                db.conn.prepare('ALTER TABLE [sprint_users] ADD COLUMN [timejoined] BIGINT DEFAULT 0').run();
                this.log(version, 'Added [timejoined] column to [sprint_users] table');
            }
            
            // Also need an extra end column on sprint table, so we can compare timejoined to the sprint end, after the [end] gets set to 0
            if (this.oldVersion < 201911052){
                db.conn.prepare('ALTER TABLE [sprints] ADD COLUMN [end_reference] BIGINT DEFAULT 0').run();
                this.log(version, 'Added [end_reference] column to [sprints] table');
            }
            
            // Completed field on projects table
            if (this.oldVersion < 201911071){
                db.conn.prepare('ALTER TABLE [projects] ADD COLUMN [completed] BIGINT DEFAULT 0').run();
                this.log(version, 'Added [completed] column to [projects] table');
            }

            // End transaction
            db.conn.prepare('COMMIT');
        
        }
                
        // Set new version in DB
        if (this.oldVersion == 0){
            
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