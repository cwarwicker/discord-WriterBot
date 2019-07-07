const moment = require('moment');
const util = require('util');

const Database = require('./../structures/db.js');
const lib = require('./../lib.js');

class Event
{
    
    constructor(guildID)
    {
        
        this.guildID = guildID;
        this.event = this.get();
        
    }
    
    exists(){
        return (this.event !== false);
    }
    
    // Does any current event exist on the server?
    any(){
        
        var record = this.get();        
        return (record) ? true : false;
        
    }
    
    // Check if the event is currently running
    is_running(){
        
        if (this.event){
            return (this.event.started > 0 && this.event.ended == 0);
        } else {
            return false;
        }
        
    }
    
    get(){
        
        var db = new Database();
        var record = db.conn.prepare('SELECT * FROM [events] WHERE [guild] = :guild AND [ended] = 0').get({
            guild: this.guildID
        });
        db.close();
        
        return (record) ? record : false;
        
    }
    
    getTitle(){
        if (this.event){
            return this.event.title;
        } else {
            return false;
        }
    }
    
    // Get the leaderboard
    getUsers(limit){
        
        var users = [];
        
        var db = new Database();
        var records = db.conn.prepare('SELECT * FROM [user_events] WHERE [event] = :event ORDER BY [words] DESC').all({event: this.event.id });
        db.close();

        if (records){
            for (var i = 0; i < records.length; i++){

                if (limit > 0 && i > limit){
                    break;
                }
                
                var user = records[i];
                users.push({id: user.user, username: user.username, words: user.words});

            }
        }
        
        // Sort results
        users.sort(function(a, b){ 
            return b.words - a.words;
        });
        
    
        
        return users;
        
    }
    
    
    create(name, channel){
        
        var db = new Database();
        
        db.conn.prepare('INSERT INTO [events] (guild, title, channel) VALUES (:guild, :name, :ch)').run({
            guild: this.guildID,
            name: name,
            ch: channel
        });
        db.close();

        return true;
        
    }
    
    delete(){
        
        if (this.event){
            var db = new Database();
            
            // Delete the event itself
            db.conn.prepare('DELETE FROM [events] WHERE [guild] = :guild AND [id] = :id').run({
                guild: this.guildID,
                id: this.event.id
            });
            
            // Delete all user_event records for it
            db.conn.prepare('DELETE FROM [user_events] WHERE [id] = :id').run({
                id: this.event.id
            });
            
            db.close();
        }
        
        return true;        
        
    }
    
    schedule(startUnix, endUnix, channel){
        
        if (this.event){
            
            var db = new Database();
            
            // Update event
            db.conn.prepare('UPDATE [events] SET [startdate] = :start, [enddate] = :end, [channel] = :ch WHERE [guild] = :guild AND [id] = :id').run({
                guild: this.guildID,
                id: this.event.id,
                start: startUnix,
                end: endUnix,
                ch: channel
            });

            db.close();
            
            return true;
            
        }
        
    }
    
    start(){
        
        if (this.event){
            
            var now = Math.floor(new Date() / 1000);
            var db = new Database();
            
            // Update event
            db.conn.prepare('UPDATE [events] SET [started] = :start WHERE [guild] = :guild AND [id] = :id').run({
                guild: this.guildID,
                id: this.event.id,
                start: now
            });

            db.close();
            
        }
        
        return true;        
        
    }
    
    
    end(){
        
        if (this.event){
            
            var now = Math.floor(new Date() / 1000);
            var db = new Database();
            
            // Update event
            db.conn.prepare('UPDATE [events] SET [ended] = :end WHERE [guild] = :guild AND [id] = :id').run({
                guild: this.guildID,
                id: this.event.id,
                end: now
            });

            db.close();
            
        }
        
        return true;        
        
    }
    
    
    update(user, words){
        
        if (this.event){
            
            var db = new Database();
            
            var record = db.conn.prepare('SELECT * FROM [user_events] WHERE [event] = :event AND [user] = :user').get({
               event: this.event.id,
               user: user.id
            });
                        
            if (!record){
                
                db.conn.prepare('INSERT INTO [user_events] (event, user, username, words) VALUES (:event, :user, :username, :words)').run({
                    event: this.event.id,
                    user: user.id,
                    username: user.username,
                    words: words
                });
                
            } else {
            
                db.conn.prepare('UPDATE [user_events] SET [words] = :words, [username] = :username WHERE [user] = :user AND [event] = :event').run({
                    words: words,
                    username: user.username,
                    user: user.id,
                    event: this.event.id
                });
            
            }
            
            db.close();
            
        }
        
        return true;        
        
    }
       
       
    static find_events_to_start(client){   
        
        var now = moment().unix();
        var db = new Database();
        
        var records = db.conn.prepare('SELECT * FROM [events] WHERE [started] = 0 AND [startdate] <= :now AND [enddate] > :now').all({
            now: now
        });
            
            
        // Start the event    
        for(var i = 0; i < records.length; i++){
            
            var record = records[i];
            var event = new Event(record.guild);
            
            // Start the event
            event.start();
            
            // Send message to channel
            try {
                client.guilds.get(record.guild).channels.get(record.channel).send( util.format( lib.get_string(record.guild, 'event:schedule:begin'), event.getTitle() ) );
            } catch(error){
                console.log(error);
            }            
            
        }    
            
        db.close();
        
        return true;
        
    }
    
    
}

module.exports = Event;