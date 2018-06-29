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