const { Command } = require('discord.js-commando');
const moment = require('moment');
require('moment-duration-format');

module.exports = class StatsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'stats',
			aliases: ['statistics'],
			group: 'util',
			memberName: 'stats',
			description: 'Displays statistics about the bot.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	run(msg) {
		return msg.embed({
			color: 3447003,
                        title: 'Writer-Bot Statistics',
			fields: [
                                {
					name: 'Version',
					value: `v0.1`,
					inline: true
				},
				{
					name: 'Uptime',
					value: moment.duration(this.client.uptime)
						.format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]'),
					inline: true
				},
                                {
					name: 'General Stats',
					value: `
• Servers: ${this.client.guilds.size}`,
					inline: false
				}
			],
                        timestamp: new Date()
                        
		});
	}
};