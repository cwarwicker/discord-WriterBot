function secsToMins(secs){
    
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
       
}


function isInt(val){
    return (typeof val === "number" && (val % 1) === 0);
}

function isNumeric(val){
    if (typeof val === 'string'){
        val = val.trim();
    }
    return (val !== '' && !isNaN(+val) && (val % 1) === 0);
}

module.exports = {secsToMins, isInt, isNumeric};