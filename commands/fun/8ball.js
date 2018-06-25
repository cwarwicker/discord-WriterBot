const { Command } = require('discord.js-commando');

module.exports = class EightBallCommand extends Command {
    constructor(client) {
        super(client, {
            name: '8ball',
            aliases: [],
            group: 'fun',
            memberName: '8ball',
            description: 'Ask the magic 8-ball a question. Your question will be routed to a text-processing AI and broken down into character sets, in order to properly analyze the content of the question and provide a meaningful answer.',
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
        
        var answers = new Array(
            '\:large_blue_circle: It is certain',
            '\:large_blue_circle: It is deciededly so',
            '\:large_blue_circle: Without a doubt',
            '\:large_blue_circle: Yes - defintely',
            '\:large_blue_circle: You may rely on it',
            '\:large_blue_circle: As I see it, yes',
            '\:large_blue_circle: Most likely',
            '\:large_blue_circle: Outlook good',
            '\:large_blue_circle: Yes',
            '\:large_blue_circle: Signs point to yes',
            '\:white_circle: Reply hazy, try again',
            '\:white_circle: Ask again later',
            '\:white_circle: Better not tell you now',
            '\:white_circle: Cannot predict now',
            '\:white_circle: Concentrate and ask again',
            '\:red_circle: Don\'t count on it',
            '\:red_circle: My reply is no',
            '\:red_circle: My sources say no',
            '\:red_circle: Outlook not so good',
            '\:red_circle: Very doubtful',
            '\:red_circle: Asbolutely not'
        );
        
        var rand = Math.floor(Math.random() * answers.length) + 1;
        msg.say( `${question}\n\n${answers[rand]}` );
        
    }
};