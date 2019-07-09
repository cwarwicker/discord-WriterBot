const fs = require('fs');
const moment = require('moment-timezone');
const Setting = require('./structures/settings.js');


module.exports.get_lang = function(guildID){
    
    // If the command was sent in a DM to the bot
    if (guildID === null) return 'en';
    
    // Otherwise, lookup server language
    var settings = new Setting();
    var lang = settings.get(guildID, 'lang');
    
    return (lang) ? lang.value : 'en';
    
}

module.exports.get_asset = function(guildID, asset){
        
    var lang = this.get_lang(guildID);
    
    var path = './assets/json/'+lang+'/'+asset;
    if (fs.existsSync(path)){
        return require(path);
    } else {
        return require('./assets/json/en/'+asset);
    }

    
}

module.exports.get_asset_path = function(guildID, asset){
        
    var lang = this.get_lang(guildID);
    
    var path = 'assets/json/'+lang+'/'+asset;
    if (fs.existsSync('./'+path)){
        return path;
    } else {
        return 'assets/json/en/'+asset;
    }

    
}

module.exports.get_string = function(guildID, str){
    
    var lang = this.get_lang(guildID);
    
    var path = './data/lang/'+lang+'.json';
    if (fs.existsSync(path)){
        var strings = require(path);
    } else {
        var strings = require('./data/lang/en.json');
    }
        
    return (strings[str]) ? strings[str] : '[[str]]';
    
}

module.exports.secsToMins = function(secs){
    
    var result = {m: 0, s: 0};
    
    if (secs < 60){
        result.s = secs;
    } else {
        
        var division = secs / 60;
        var mins = Math.floor(division);
        var secondsDiv = secs % 60;
        var seconds = Math.ceil(secondsDiv);
        
        result.m = mins;
        result.s = seconds;
        
    }
    
    return result;  
       
};

module.exports.isInt = function(val){
    return (typeof val === "number" && (val % 1) === 0);
};

module.exports.isNumeric = function(val){
    if (typeof val === 'string'){
        val = val.trim();
    }
    return (val !== '' && !isNaN(+val) && (val % 1) === 0);
};

module.exports.getMember = function(msg, id){
    return msg.guild.members.find('id', id);
};

module.exports.getMemberByMention = function(msg, mention){
    
    var id = mention.replace(/\D/g, '');
    
    var userArray = msg.guild.members.array();
    for (var i = 0; i < userArray.length; i++){
        var user = userArray[i];
        if (user.user.id === id){
            return user.user;
        }
    }
    
    return false;
    
};

module.exports.getMemberByName = function(msg, name){
    
    // If the name is actually a mention, e.g. <@123456789>, then get it by that instead
    var match = name.match(/^<@\d+>$/i);
    if (match !== null){
        return module.exports.getMemberByMention(msg, name);
    }
    
    var userArray = msg.guild.members.array();
    for (var i = 0; i < userArray.length; i++){
        var user = userArray[i];
        if (user.user.username === name){
            return user.user;
        }
    }
    
    return false;
    
};

module.exports.getBotServer = function(bot, id){
    return bot.guilds.find('id', id);
};

module.exports.getServerChannel = function(server, id){
    return server.channels.find('id', id);
};

module.exports.findObjectByKey = function(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
};

module.exports.findObjectArrayKeyByKey = function(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return i;
        }
    }
    return null;
};

module.exports.is_valid_time = function(time){
        
    var pat = /^([0-1]?[0-9]|2[0-3]):?([0-5][0-9])$/;
    return (time.match(pat) !== null);
        
};

module.exports.is_valid_date = function(date, format){
    return moment(date, format, true).isValid();
};

module.exports.convert_date_time_to_unix = function(date, time, offset){
        
    // Get the timestamp of that date on the server
    var timestamp = moment(date + ' ' + time, 'DD-MM-YYYY HH:mm');
    
    // Convert that to UTC if the server is not UTC
    var utc = moment.tz(     timestamp.format('YYYY-MM-DD HH:mm'), 'UTC'    );
    
    // Adjust by offset
    return utc.unix() - (offset * 60);
    
};

module.exports.convert_ddmmyyyy_to_yyyymmdd = function(date, time){
    
    // Split the date and reverse it into a number
    let split = date.split("-");
    let reverse = split.reverse();
    var newDate = reverse.join("");
    
    // Split the time and reverse it into a number and append it to the date
    if (time !== undefined){
        
        newDate += time.replace(/\D/g, "");
        
    }
    
    return newDate;
    
};

module.exports.convert_time_left_hr = function(now, end){
    
    var left = end - now;
    
    var h = Math.floor(left/ 3600);
    var m = Math.floor(left % 3600 / 60);
    var s = Math.floor(left % 3600 % 60);

    var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
    
};

module.exports.log = function(data){
    
    fs.appendFile('data/logs', data + '\n', (err) => {  
        // throws an error, you could also catch it here
        if (err) throw err;
    });
    
};
