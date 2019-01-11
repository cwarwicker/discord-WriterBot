const { Command } = require('discord.js-commando');
const version = require('./../../version.json');

module.exports = class PatchCommand extends Command {
    constructor(client) {
            super(client, {
                    name: 'patch',
                    aliases: [],
                    group: 'util',
                    memberName: 'patch',
                    description: 'Displays the latest patch notes for the bot'
            });
    }

    run(msg) {
        return msg.reply('Patch notes for **'+version.version+'** can be found here: https://github.com/cwarwicker/discord-WriterBot/wiki/Patch-Notes');
    }
};