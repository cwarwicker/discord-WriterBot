const fs = require('fs');
const path = require('path');
const lib = require('./../lib.js');

const maxLimit = 25;

class NameGenerator
{
    
    constructor()
    {
        this.defaultLimit = 10;
    }
        
    
    generate(msg, type, limit)
    {
        
        var guildID = (msg.guild !== null) ? msg.guild.id : null;

        // Make sure limit is correct
        if (limit > maxLimit){
            limit = maxLimit;
        }
        
        if (limit < 1){
            limit = this.defaultLimit;
        }
                
        
        // Load the source
        var filepath = lib.get_asset_path(guildID, 'gen_'+type+'.json')
                        
        try {
            
            let result = fs.statSync('./'+filepath);
                                    
            // Exists
            if (result.isFile()){
                                                                
                // Get the contents of the json file
                var source = require('./../'+filepath);
                                
                var results = [];
                var retries = 0;
                
                // Writing Prompts slightly different
                if (type === 'idea'){
                    limit = 1;
                }
                                                                
                
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
                    if (type !== 'idea'){
                        var arr = str.split(" ");

                        for (var k in arr){
                            arr[k] = arr[k].charAt(0).toUpperCase() + arr[k].slice(1).toLowerCase();
                        }

                        str = arr.join(" ");
                    }
                    
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
                    resp += 'Here are your ' + limit + ' character names:\n\n';
                } else if(type === 'place'){
                    resp += 'Here are your ' + limit + ' fantasy place names:\n\n';
                } else if(type === 'land'){
                    resp += 'Here are your ' + limit + ' fantasy land names:\n\n';
                } else if(type === 'book'){
                    resp += 'Here are your ' + limit + ' book titles:\n\n';
                } else if(type === 'book_fantasy'){
                    resp += 'Here are your ' + limit + ' fantasy book titles:\n\n';
                } else if(type === 'book_sf'){
                    resp += 'Here are your ' + limit + ' sci-fi book titles:\n\n';
                } else if(type === 'book_hp'){
                    resp += 'Here are your ' + limit + ' Harry Potter book titles:\n\n';
                } else if(type === 'book_erotica'){
                    resp += 'Here are your ' + limit + ' erotic book titles:\n\n';
                } else if(type === 'book_mystery'){
                    resp += 'Here are your ' + limit + ' mystery book titles:\n\n';
                } 
                
                resp += results.join('\n');
                
                return msg.say( resp );
                
            } else {
                return null;
            }
            
        } catch(e){
            
            var replyArray = ['Er...what?', 'Generate what, now?', 'I can\'t do that', 'That sounds like a cool feature, maybe I should add it.'];
            var rand = Math.round(Math.random() * (replyArray.length - 1));
            msg.say( replyArray[rand] );
            return null;
            
        }
        
        
    }
    
    
    
}

module.exports = NameGenerator;