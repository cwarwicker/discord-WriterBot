const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');

const moment = require('moment');
require('moment-duration-format');

const version = require('./../../version.json');

module.exports = class InfoCommand extends Command {
	constructor(client) {
            super(client, {
                    name: 'feedback',
                    aliases: [],
                    group: 'util',
                    memberName: 'feedback',
                    description: 'The `feedback` command has been removed due to spam. If you need any help with Writer-Bot please join the Support Server: https://discord.gg/awaC6Vq'
            });
	}

	run(msg) {
            return msg.say(lib.get_string(msg.guild.id, 'feedback:info'));
	}
};