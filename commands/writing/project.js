const { Command } = require('discord.js-commando');
const Project = require('./../../structures/project.js');
const lib = require('./../../lib.js');

module.exports = class ProjectCommand extends Command {
    constructor(client) {
        
        super(client, {
            name: 'project',
            aliases: [],
            group: 'writing',
            memberName: 'project',
            guildOnly: true,
            description: 'Using these commands, you can create different projects and store word counts against them seperately. They also integrate with the `wrote` and `sprint` commands. See the help information for those commands for more info.',
            examples: [
                '`project create sword The Sword in the Stone` Create a new project with the shortname (used to reference the project for word count updates) "sword" and title "The Sword in the Stone"',
                '`project delete sword` Delete your project with the shortname "sword"',
                '`project view` View a list of all your current projects',
                '`project update sword 65000` Set the wordcount to 65000 for your project with the shortname "sword" (this is for words already written outside of Writer-Bot)'
            ],
            args: [
                {
                    key: "action",
                    prompt: "What do you want to do? `create` a project? `delete` a project? `view` a project?",
                    type: "string"
                },
                {
                    key: "arg1",
                    default: "",
                    prompt: "",    
                    type: "string"    
                },
                {
                    key: "arg2",
                    default: "",
                    prompt: "",    
                    type: "string"    
                }
            ]
        });
                
    }

    run(msg, {action, arg1, arg2}) {
        
        // Create a project
        if (action == 'create'){
            return this.run_create(msg, arg1, arg2);
        }
        
        else if(action == 'delete'){
            return this.run_delete(msg, arg1);
        }
        
        else if(action == 'view'){
            return this.run_view(msg);
        }
        
        else if(action == 'update'){
            return this.run_update(msg, arg1, arg2);
        }
        
        else
        {
            return msg.say( 'Invalid command options' );
        }
        
    }
    
    run_create(msg, shortname, title){
                
        let guildID = msg.guild.id;
        let userID = msg.author.id;
                
        // Make sure shortnbame and title are set
        if (shortname.length < 1 || title.length < 1){
            return msg.reply('Please make sure your project shortname and title are set: `project create shortname title`');
        }
        
        // Check they don't already have a project with this shortname
        var project = new Project(msg, guildID, userID);
        var record = project.get(shortname);
        if (record){
            return msg.reply('You already have a project with that shortname');
        }
        
        project.create(shortname, title);
        return msg.reply('Project created: ' + title + ' ('+shortname+')');
        
    }
    
    run_delete(msg, shortname){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        // Check they don't already have a project with this shortname
        var project = new Project(msg, guildID, userID);
        var record = project.get(shortname);
        if (!record){
            return msg.reply('You do not have a project with that shortname');
        }
        
        // Delete it
        project.delete(shortname);
        return msg.reply('Project deleted: ' + record.name + ' ('+record.shortname+')');
        
    }
    
    run_view(msg){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var project = new Project(msg, guildID, userID);
        var projects = project.all();
        
        var content = '';
        if (projects){
            projects.forEach( function(el){
                content += '**'+el.name+'** *('+el.shortname+')*\n';
                content += 'Word count: ' + el.words + '\n\n';
            } );
        }
        
        return msg.reply('Here are your current projects:\n\n' + content);
        
    }
    
    run_update(msg, shortname, words){
        
        let guildID = msg.guild.id;
        let userID = msg.author.id;
        
        var project = new Project(msg, guildID, userID);
        var record = project.get(shortname);
        if (!record){
            return msg.reply('You do not have a project with that shortname ('+shortname+')');
        }
        
        // Update it
        project.update(shortname, words);
        return msg.reply(record.name + ' word count updated to ' + words);
        
    }
    
};