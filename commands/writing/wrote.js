const { Command } = require('discord.js-commando');
const util = require('util');
const lib = require('./../../lib.js');

const Stats = require('./../../structures/stats.js');
const Goal = require('./../../structures/goal.js');
const Project = require('./../../structures/project.js');
const Event = require('./../../structures/event.js');

module.exports = class WroteCommand extends Command {
    constructor(client) {
        
        super(client, {
            name: 'wrote',
            aliases: [],
            group: 'writing',
            memberName: 'wrote',
            guildOnly: true,
            description: 'Add to your total words written statistic',
            examples: [
                '`wrote 250` Will add another 250 words to your total words written stat',
                '`wrote 200 sword` Will add another 200 words to your Project with the shortname "sword" (See: Projects for more info)'
            ],
            args: [
                {
                    key: "amount",
                    prompt: "How many words did you write?",
                    type: "integer"
                },
                {
                    key: "shortname",
                    prompt: "",
                    default: "",
                    type: "string"
                }
                
            ]
        });
                
    }

    run(msg, {amount, shortname}) {
        
        var stats = new Stats();
        
        if (!lib.isNumeric(amount)){
            return msg.say(lib.get_string(msg.guild.id, 'err:validamount'));
        }
        
        
        // Did they specify a project?
        if (shortname !== undefined && shortname.length > 0){
            
            var project = new Project(msg, msg.guild.id, msg.author.id);
            var record = project.get(shortname);
            if (record){
                
                var words = record.words + amount;
                project.update(shortname, words);
                var output = `${msg.author} ${util.format(lib.get_string(msg.guild.id, 'wrote:addedtoproject'), amount, record.name, words)}`;        
                
            } else {
                return msg.reply(util.format(lib.get_string(msg.guild.id, 'project:noexists'), shortname));
            }
            
        }
        
        // Is there an event running?
        var event = new Event(msg.guild.id);
        if (event.is_running()){
            var eventWordCount = event.getUserWordCount(msg.author.id);
            event.update(msg.author, (eventWordCount + amount));
        }
                
        // Increment their words written stat
        stats.inc(msg.guild.id, msg.author.id, 'total_words_written', amount);
        
        // Increment their words towards their daily goal
        var goal = new Goal(msg, msg.guild.id, msg.author.id);
        goal.inc(amount);
        
        // Get their new total
        var total = stats.get(msg.guild.id, msg.author.id, 'total_words_written');
        
        // This message is only used if no project was specified
        if (output === undefined){
            var output = `${msg.author} ${util.format(lib.get_string(msg.guild.id, 'wrote:added'), amount, total.value)}`;        
        }
                        
        return msg.say(output);
        
    }
};