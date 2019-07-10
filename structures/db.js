const SQLITE = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const settings = require('./../settings.json');


class Database
{
    
    constructor()
    {
                
        // Connect to/Create database
        try {
            this.conn = new SQLITE(path.resolve(__dirname + '/../data/db/', 'bot.db'));
        } catch (e){
            console.error(e.message);
            this.conn = false;
        }
        
        if (!this.conn){
            console.error('[ERROR] Could not connect to db');
            process.exit(1);
        }
        
    }
    
    init()
    {
                    
        var install_path = path.resolve(__dirname + '/../data/install');

        // Run create tables if they don't exist
        this.conn.prepare('BEGIN');

            this.conn.prepare( fs.readFileSync(install_path + '/bot_settings.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/guilds.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/guild_settings.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/sprints.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/sprint_users.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/user_records.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/user_xp.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/user_challenges.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/user_stats.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/user_goals.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/projects.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/events.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/user_events.sql', 'utf-8') ).run();
            this.conn.prepare( fs.readFileSync(install_path + '/user_settings.sql', 'utf-8') ).run();

        this.conn.prepare('COMMIT');
        
    }
    
    close()
    {
        this.conn.close();
    }
    
    
}


module.exports = Database;