const fs = require('fs');
const maxLimit = 25;

class NameGenerator
{
    
    constructor()
    {
        this.defaultLimit = 10;
    }
        
    
    generate(msg, type, limit)
    {
        
        // Make sure limit is correct
        if (limit > maxLimit){
            limit = maxLimit;
        }
        
        if (limit < 1){
            limit = this.defaultLimit;
        }
        
        // Load the source
        var path = 'assets/json/gen_'+type+'.json';
        
        try {
            
            let result = fs.statSync('./'+path);
            
            // Exists
            if (result.isFile()){
                
                // Get the contents of the json file
                var source = require('./../../'+path);
                var results = [];
                var retries = 0;
                                
                
                // Loop through n number of times
                for (var i = 0; i < limit; i++)
                {

                    var last = '';
                    
                    // Pick a random format
                    var format = source.formats[Math.floor(Math.random()*source.formats.length)];
                    
                    // Build the string
                    var str = format.replace(/\$(\d+|[a-z]+)/g, function(match, capture){

                        var arr = source.names[capture];
                        var el = arr[Math.floor(Math.random()*arr.length)];
                        
                        // We don't want the same string twice in a row, e.g. "riverriver", although it it's 2 or less characters, we can accept that.
                        while (el.length > 2 && el === last){
                            el = arr[Math.floor(Math.random()*arr.length)];
                        }
                        
                        last = el;
                        
                        return el;

                    });
                                        
                    // Capitalise first letter of each word
                    var arr = str.split(" ");
                                        
                    for (var k in arr){
                        arr[k] = arr[k].charAt(0).toUpperCase() + arr[k].slice(1).toLowerCase();
                    }
                    
                    str = arr.join(" ");
                    
                    // If we haven't already got this exact one, append to results array
                    if (results.indexOf(str) < 0){
                        results.push(str);
                        retries = 0;
                    } else {

                        // if we have already got this exact one, try again to find a new one, unless we have already tried this 10 times, in which case give up and move on
                        if (retries < 10){
                            retries++;
                            i--;
                        }

                    }				

                }

                results.sort();
                
                var resp = '';
                
                if (type === 'char'){
                    resp += 'Here are your ' + limit + ' fantasy character names:\n\n';
                } else if(type === 'place'){
                    resp += 'Here are your ' + limit + ' fantasy place names:\n\n';
                } else if(type === 'land'){
                    resp += 'Here are your ' + limit + ' fantasy land names:\n\n';
                }
                
                resp += results.join('\n');
                
                return msg.say( resp );
                
            } else {
                return null;
            }
            
        } catch(e){
            return null;
        }
        
        
    }
    
    
    
}

module.exports = NameGenerator;