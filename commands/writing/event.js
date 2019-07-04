const { Command } = require('discord.js-commando');
const util = require('util');
const lib = require('./../../lib.js');
const Event = require('./../../structures/event.js');


module.exports = class EventCommand extends Command {
    constructor(client) {
        
        super(client, {
            name: 'event',
            aliases: [],
            group: 'writing',
            memberName: 'event',
            guildOnly: true,
            description: 'Using these commands, you can create your own server writing events (like NaNoWriMo) and compete against each other to see who can write the most',
            examples: [
                
            ],
            args: [
                {
                    key: "action",
                    prompt: "",
                    default: "",
                    type: "string"
                },
                {
                    key: "arg1",
                    default: "",
                    prompt: "",    
                    type: "string"    
                }
            ]
        });
        
        this.waiting = [];
                
    }

    async run(msg, {action, arg1}) {
        
        // Add guild to waiting array if not already set
        var key = lib.findObjectArrayKeyByKey(this.waiting, 'guild', msg.guild.id);
        if (key === null){
            this.waiting.push({guild: msg.guild.id, users: []});
            key = lib.findObjectArrayKeyByKey(this.waiting, 'guild', msg.guild.id);
        }
                
        // Just display the name and info
        if (action.length === 0){
            return this.run_info(msg);
        }
        
        // Create an event
        else if (action === 'create'){
            return this.run_create(msg, arg1);
        }
        
        // Delete an event
        else if(action === 'delete'){
            return this.run_delete(msg);
        }
        
        // Start an event
        else if(action === 'start'){
            return this.run_start(msg);
        }
        
        // End an event
        else if(action === 'end'){
            return this.run_end(msg);
        }
                
        
        // Update your event progress made outside of the bot
        else if(action === 'update'){
            return this.run_update(msg, arg1);
        }
        
        // View your own progress in an event
        else if(action === 'me'){
            
        }
        
        // View the leaderboard for the event
        else if(action === 'leaderboard'){
            
        }
        
        // View the top leaderboard of historical events
        else if(action === 'history'){
            
        }
        
        // Also todo: 
        // sprint - if an event is active, automatically add wordcount to it
        // wrote - if an event is active, automatically add wordcount to it
        
        
        
    }
    
    get_leaderboard(msg, mention){
        
        var event = new Event(msg.guild.id);
        var users = event.getUsers();
        var output = '';
        
        for (var i = 0; i < users.length; i++){
            
            var user = users[i];
            var pos = i+1;
            output += pos + '. ';
            
            // Last known username
            var username = user.username;
            
            // If they are still a member, get their name properly
            var member = lib.getMember(msg, user.id);
            if (member){
                if (mention === true){
                    username = `<@${member.id}>`;
                } else {
                    username = member.user.username;
                }
            }
            
            output += username;
            
            // Word count
            output += '          **'+user.words+' Words**';
            
        }
        
        return output;
        
    }
    
    run_info(msg){
        
        let guildID = msg.guild.id;
        
        var event = new Event(guildID);
        
        if (event.is_running()){
        
            var output = '';
            output += '**'+event.getTitle()+'**\n\n';
            output += ':trophy: -------------------- ' + lib.get_string(guildID, 'event:leaderboard') + ' -------------------- :trophy:\n\n';
            output += this.get_leaderboard(msg);
            
            return msg.say(output);
        
//            return msg.embed({
//			color: 3447003,
//                        author: {
//                            name: client.user.username
//                        }
//                        
//		});
        
        }        
        
    }
    
    // Create an event
    run_create(msg, title){
        
        let guildID = msg.guild.id;
        
        var event = new Event(guildID);
        title = title.trim();
        
        // Make sure shortnbame and title are set
        if (title.length < 1){
            return msg.reply(lib.get_string(msg.guild.id, 'event:title'));
        }
        
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Is there already a current event?
        if (event.any()){
            return msg.say( lib.get_string(msg.guild.id, 'event:already') );
        }
        
        // Create the event
        event.create( title );
        return msg.say( util.format( lib.get_string(msg.guild.id, 'event:created'), title ) );

    }
    
    run_delete(msg){
        
        let userID = msg.author.id;
        let guildID = msg.guild.id;
        
        var event = new Event(guildID);
        
        // Are we currently waiting for a yes/no response?
        var key = lib.findObjectArrayKeyByKey(this.waiting, 'guild', guildID);
        var uKey = this.waiting[key].users.indexOf(userID);

        var wait = this.waiting[key].users[uKey];
        if (wait >= 0){
            msg.say(lib.get_string(msg.guild.id, 'event:plsrespond'));
            return null;
        }

        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Is there already a current event?
        if (!event.any()){
            return msg.say( lib.get_string(msg.guild.id, 'event:noexists') );
        }
        
        // Are you sure you want to delete it?
        msg.say(lib.get_string(msg.guild.id, 'event:deletesure'));
        
        // Push them into waiting array
        this.waiting[key].users.push(userID);
        
        // Wait for yes/no answer
        msg.channel.awaitMessages( m => ( (m.author.id == userID) && (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'no') ), {
            max: 1,
            time: 30000,
            errors: ['time']
        } ).then(mg => {

            var answer = mg.first().content;
            if (answer.toLowerCase() === 'yes'){

                // Delete it
                event.delete();
                msg.say( util.format( lib.get_string(msg.guild.id, 'event:deleted'), event.getTitle() ) );

            } else {
                msg.say(`OK`);
            }

            // Remove waiting
            this.waiting[key].users = this.waiting[key].users.filter(function(e){ (e !== userID) });
            return null;

        }).catch((err) => {
            // Remove waiting
            this.waiting[key].users = this.waiting[key].users.filter(function(e){ (e !== userID) });
            return null;
        });
                
    }
    
    run_start(msg){
        
        let guildID = msg.guild.id;
        
        var event = new Event(guildID);
        
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Is there already a current event?
        if (!event.any() || event.is_running()){
            return msg.say( lib.get_string(msg.guild.id, 'event:cannotstart') );
        }
        
        // Create the event
        event.start();
        
        var output = util.format( lib.get_string(msg.guild.id, 'event:started'), event.getTitle() );
        return msg.say( output );
        
    }
    
    run_end(msg){
        
        let guildID = msg.guild.id;
        
        var event = new Event(guildID);
        
        // Are you a server mod/admin?
        if (!msg.member.hasPermission('MANAGE_MESSAGES')){
            return msg.say( lib.get_string(msg.guild.id, 'event:permissions') );
        }
        
        // Is there already a current event?
        if (!event.is_running()){
            return msg.say( lib.get_string(msg.guild.id, 'event:notrunning') );
        }
        
        // Create the event
        event.end();
        
        var output = util.format( lib.get_string(msg.guild.id, 'event:ended'), event.getTitle() );
        
        // Leaderboard
        // TODO
        
        return msg.say( output );
        
    }
    
    run_update(msg, wordcount){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var event = new Event(guildID);
        
        // Must be numeric
        if (!lib.isNumeric(wordcount)){
            return msg.say(lib.get_string(msg.guild.id, 'err:validamount'));
        }

        // Is there already a current event?
        if (!event.is_running()){
            return msg.say( lib.get_string(msg.guild.id, 'event:notrunning') );
        }
        
        // Update your wordcount for the event
        event.update(msg.author, wordcount);
        return msg.say( `${msg.author} ${util.format(lib.get_string(msg.guild.id, 'event:updated'), event.getTitle())} ${wordcount}` );
        
    }
    
    
};