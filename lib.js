const fs = require('fs');
const Setting = require('./structures/settings.js');


module.exports.get_lang = function(guildID){
    
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

module.exports.getMemberByName = function(msg, name){
    
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

module.exports.log = function(data){
    
    fs.appendFile('data/logs', data + '\n', (err) => {  
        // throws an error, you could also catch it here
        if (err) throw err;
    });
    
}