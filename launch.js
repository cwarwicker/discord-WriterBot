const { ShardingManager } = require('discord.js');
const settings = require('./settings.json');

const manager = new ShardingManager('./bot.js', { token: settings.token });

manager.spawn();
manager.on('launch', shard => console.log(`Launched shard ${shard.id}`));