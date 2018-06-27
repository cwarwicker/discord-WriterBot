const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');
const settings = require('./../../settings.json');

module.exports = class FeedbackCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'feedback',
            aliases: [],
            group: 'util',
            memberName: 'feedback',
            description: 'Send anonymous feedback about Writer-Bot',
            examples: [
                '`feedback` Will prompt you for your feedback',
                '`feedback yes` Will set the message to anonymous and prompt you for your feedback',
                '`feedback no This is my feedback` Will send "This is my feedback", displaying your username with the feedback',
            ],
            args: [
                {
                    key: "anon",
                    prompt: "Would you like your feedback to be anonymous? (yes|no)",
                    type: "string",
                    time: 10
                },
                {
                    key: "feedback",
                    prompt: "What is your feedback?",
                    type: "string"
                }
            ]
        });
    }

    run(msg, {anon, feedback}) {
        
        // Find my server
        var server = lib.getBotServer(this.client, settings.feedback_server);
        if (server){
            
            // Find the writer-bot channel
            var channel = lib.getServerChannel(server, settings.feedback_channel);
            if (channel){
                
                var output = '';
                
                if (anon.toLowerCase() !== 'yes' && anon.toLowerCase() !== 'y'){
                    output += `${msg.author}: `;
                }
                
                output += feedback;
                
                // Send the message
                channel.send(output).then(() => {
                    msg.say('Thanks, your feedback has been sent!');
                }).catch(console.error);
                
            }
            
            
        }
        
    }
};