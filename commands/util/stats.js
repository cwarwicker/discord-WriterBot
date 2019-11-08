const { Command } = require('discord.js-commando');
const lib = require('./../../lib.js');
const Stats = require('./../../structures/stats.js');
const Project = require('./../../structures/project.js');

module.exports = class StatsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'stats',
			aliases: [],
			group: 'util',
			memberName: 'stats',
			description: 'Displays overall server statistics.',
			guildOnly: true
		});
	}

	run(msg) {
            
            let guildID = msg.guild.id;

            var stats = new Stats();
            var content = '';
            
            content += ':chart_with_downwards_trend: :bar_chart: :chart_with_upwards_trend: :chart: :chart_with_downwards_trend: :bar_chart: :chart_with_upwards_trend: :chart: \n';
            content += '**'+lib.get_string(guildID, 'serverstats') + '**\n';
            content += '*'+lib.get_string(guildID, 'serverstats:info') + '*\n\n';
            
            // Words written in total
            content += lib.get_string(guildID, 'stats:words') + '**' + stats.get_server_total(guildID, 'total_words_written') + '**\n';
            
            // Number of sprints
            content += lib.get_string(guildID, 'stats:sprints') + '**' + stats.get_server_total(guildID, 'sprints_started') + '**\n';
            
            // Words written in sprints
            content += lib.get_string(guildID, 'stats:sprintwords') + '**' + stats.get_server_total(guildID, 'sprints_words_written') + '**\n';

            // Daily goals achieved
            content += lib.get_string(guildID, 'stats:dailygoals') + '**' + stats.get_server_total(guildID, 'daily_goals_completed') + '**\n';
            
            // Challenges completed
            content += lib.get_string(guildID, 'stats:challenges') + '**' + stats.get_server_total(guildID, 'challenges_completed') + '**\n';
        
            var project = new Project(msg, guildID, null);
            
            // Projects on-the-go
            content += lib.get_string(guildID, 'stats:projects') + '**' + project.get_server_total(guildID, false) + '**\n';
            
            // Projects completed
            content += lib.get_string(guildID, 'stats:projectscompleted') + '**' + project.get_server_total(guildID, true) + '**\n';

            return msg.say( content );
		
	}
};