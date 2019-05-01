const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');

module.exports = class EightBallCommand extends Command {
    constructor(client) {
        super(client, {
            name: '8ball',
            aliases: [],
            group: 'fun',
            memberName: '8ball',
            description: 'Ask the magic 8-ball a question. Your question will be routed to a text-processing AI and broken down into character sets, in order to properly analyze the content of the question and provide a meaningful answer.',
            examples: [
                '`8ball Should I do some writing?`'
            ],
            args: [
                {
                    key: "question",
                    prompt: "What is your question?",
                    type: "string"
                }
            ]
        });
    }

    run(msg, {question}) {
        
        var guildID = (msg.guild !== null) ? msg.guild.id : null;

        var answers = new Array(
            lib.get_string(guildID, '8ball:0'),
            lib.get_string(guildID, '8ball:1'),
            lib.get_string(guildID, '8ball:2'),
            lib.get_string(guildID, '8ball:3'),
            lib.get_string(guildID, '8ball:4'),
            lib.get_string(guildID, '8ball:5'),
            lib.get_string(guildID, '8ball:6'),
            lib.get_string(guildID, '8ball:7'),
            lib.get_string(guildID, '8ball:8'),
            lib.get_string(guildID, '8ball:0'),
            lib.get_string(guildID, '8ball:10'),
            lib.get_string(guildID, '8ball:11'),
            lib.get_string(guildID, '8ball:12'),
            lib.get_string(guildID, '8ball:13'),
            lib.get_string(guildID, '8ball:14'),
            lib.get_string(guildID, '8ball:15'),
            lib.get_string(guildID, '8ball:16'),
            lib.get_string(guildID, '8ball:17'),
            lib.get_string(guildID, '8ball:18'),
            lib.get_string(guildID, '8ball:19'),
            lib.get_string(guildID, '8ball:20')
        );
        
        var rand = Math.floor(Math.random() * answers.length);
        msg.say( `"${question}"\n\n${answers[rand]}` );
        
    }
};