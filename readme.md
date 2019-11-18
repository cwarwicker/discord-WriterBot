# Writer-Bot (0.9)

https://github.com/cwarwicker/discord-WriterBot/wiki/Patch-Notes

Writer-Bot is a discord bot for writing-based servers.

It has many features, such as writing sprints, word count goals, xp/levels, prompts and random generators.

**Writing-related commands**

`!ask`: Asks you a random question about your character or your world, to get the creative juices flowing.

`!challenge`: Generates a random writing challenge for you. e.g. "Write 400 words in 15 minutes". You can add the flags "easy", "normal", "hard", "hardcore", or "insane" to choose a pre-set wpm, or add your chosen wpm as the flag, or you can specify a time instead by adding a the time in minutes, prefixed with a "t", e.g. "t15"

`!event`: Create server-wide writing events and compete against your fellow writers to see who can write the most

`!generate`: Random generator for various things (character names, place names, land names, book titles, story ideas). Define the type of item you wanted generated and then optionally, the amount of items to generate.

`!goal`: Sets a daily goal which resets every 24 hours

~~`!lookup`:~~ [This command was removed in v0.8, as the dictionary API it was using to lookup words is no longer free to use.]

`!project`: Using these commands, you can create different projects and store word counts against them seperately. They also integrate with the wrote and sprint commands. See the help information for those commands for more info.

`!prompt`: Generates a random writing prompt. Initial prompts taken from (thewritersacademy and /r/writingprompts)

`!sprint`: Write with your friends and see who can write the most in the time limit!

`!wrote`: Add to your total words written statistic


**Fun commands**

`!8ball`: Ask the magic 8-ball a question. Your question will be routed to a text-processing AI and broken down into character sets, in order to properly analyze the content of the question and provide a meaningful answer.

`!flip`: Flips a coin

`!profile`: Displays your user statistics for this server

`!quote`: Gives you random motivational quote

`!reassure`: Gives you reassurance/motivation

`!roll`: Rolls a dice between 1-6, or 1 and a specified number. Or roll multiple dice and get the total score.

`!xp`: Checks your server Experience Points and Level. Use the "top" flag to see the top 10 on this server.


**Utility Commands**

`!info`: Shows bot information and status

`!patch`: Shows the latest patch notes for the bot

`!reset`: Allows you to reset your stats or the whole server (if you have the MANAGE_MESSAGES permission)

`!myset`: Allows you to set user configuration values, such as your timezone

`!set`: Allows users with the (MANAGE_MESSAGES) permission on the server, to change configuration values


***

For further information about any of the commands, run `!help <command>`, e.g. `!help event` or `!help sprint`