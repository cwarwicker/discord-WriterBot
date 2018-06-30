const { Command } = require('discord.js-commando');
const Database = require('./../../structures/db.js');
const Goal = require('./../../structures/goal.js');
const lib = require('./../../lib.js');

module.exports = class GoalCommand extends Command {
    constructor(client) {
                
        super(client, {
            name: 'goal',
            aliases: [],
            group: 'writing',
            memberName: 'goal',
            description: 'Sets a daily goal which resets every 24 hours',
            examples: [
                '`goal` - Checks how close you are to your daily goal',
                '`goal set 500` - Sets your daily goal to be 500 words',
                //'`goal week set 2500` - Sets your weekly goal to be 500 words',
                //'`goal month set 10000` - Sets your monthly goal to be 500 words',
                //'`goal year set 100000` - Sets your yearly goal to be 500 words',
                '`goal cancel` - Deletes your daily goal'
            ],
            args: [
                {
                    key: 'option',
                    prompt: 'What do you want to do with your goal? (`check`, `set`)',
                    default: 'check',
                    type: 'string'
                },
                {
                    key: 'value',
                    prompt: '',
                    default: '',
                    type: 'integer'
                }
            ]
        });
                        
    }

    run (msg, {option, value}){
                
       // Daily goal
       if (option === 'set'){
           return this.run_set(msg, value);
       } else if (option === 'cancel' || option === 'delete'){
           return this.run_cancel(msg);
       } else {
           return this.run_check(msg);
       }        
        
    }
    
    run_check(msg){
        
        var type = 'daily'; // Only daily goals currently
        var goal = new Goal(msg, msg.guild.id, msg.author.id);
        var record = goal.get(type);
        
        if (record){
            
            var percent = Math.floor((record.current / record.goal) * 100);
            
            var progressDone = Math.floor(percent/10);
            var progressLeft = 10 - progressDone;
            
            if (progressDone > 10) progressDone = 10;
            if (progressLeft < 0) progressLeft = 0;
            
            var percentStr = '[' + ('- '.repeat(progressDone)) + ('  '.repeat(progressLeft)) +  ']';
            
            return msg.say(`${msg.author}: You are ${percentStr} **${percent}%** of the way to your ${type} goal. (${record.current}/${record.goal})`);            
            
        } else {
            return msg.say(`${msg.author}: You do not currently have a ${type} goal. I think you should set one, e.g. \`goal set <wordcount>\``);
        }
    
    }
    
    
    run_cancel(msg){
        
        var type = 'daily'; // Only daily goals currently
        
        var goal = new Goal(msg, msg.guild.id, msg.author.id);
        goal.delete(type);
        
        return msg.say(`${msg.author} has given up on their ${type} goal. Boo.`);
        
    }
    
    // Set their daily goal
    run_set(msg, value){
        
        var type = 'daily'; // Only daily goals currently
                
                
                
        if (!lib.isInt(value)){
            return msg.say('Please enter a valid amount > 0');
        }
        
        var goal = new Goal(msg, msg.guild.id, msg.author.id);
        var result = goal.set(type, value);
        
        if (result){
            return msg.say(`${msg.author}: ${type} goal set to **${value}** words. Get writing!`);
        } else {
            return msg.say('Something went wrong.');
        }
        
    }
    
    
};