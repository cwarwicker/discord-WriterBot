const { Command } = require('discord.js-commando');
const moment = require('moment');
require('moment-duration-format');
const version = require('./../../version.json');
const Stats = require('./../../structures/stats.js');

module.exports = class InfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'info',
			aliases: [],
			group: 'util',
			memberName: 'info',
			description: 'Displays information and statistics about the bot.',
			guildOnly: true
		});
	}

	run(msg) {
            
            var stats = new Stats();
            
		return msg.embed({
			color: 3447003,
                        title: 'Writer-Bot Info/Statistics',
			fields: [
                                {
					name: 'Version',
					value: `v${version.version}`,
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
• Servers: ${this.client.guilds.size}
• Active Sprints: ${stats.getTotalActiveSprints()}
`,
					inline: false
				}
			],
                        timestamp: new Date()
                        
		});
	}
};