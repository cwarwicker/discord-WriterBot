const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');

module.exports = class WhosTheBestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'whosthebest',
            aliases: [],
            group: 'fun',
            memberName: 'whosthebest',
            description: 'Find out who is the best'
        });
    }

    run(msg) {
        
        var answers = new Array(
            'The best? Like..THE..best? Probably, CMR.',
            'Give me a C..give me an M...give me an R...what do you get? CMR!',
            'This again? CMR is the best, quit asking.',
            'How many times do I have to answer this? It\'s CMR.',
            'You know it. I know it. We all know it\'s CMR, so why keep asking?',
            '...Really? You\'re going to make me proclaim you to be the best for the 18th time today? Don\'t you have better things to be doing? Ugh, fine... Yes, CMR is the best. Hurray for CMR. Happy now?'
        );
        
        var rand = Math.floor(Math.random() * answers.length);
        msg.say( `${answers[rand]}` );
        
    }
};