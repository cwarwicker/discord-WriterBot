const { Command } = require('discord.js-commando');
const settings = require('./../../settings.json');
const axios = require('axios');

module.exports = class LookupCommand extends Command {
    constructor(client) {
                
        super(client, {
            name: 'lookup',
            aliases: ['define'],
            group: 'writing',
            memberName: 'lookup',
            description: 'Looks up the definitions of a given word, using the Oxford English Dictionary API. Add the flag `s` to search for synonymns, or `a` for antonyms.',
            examples: ['`lookup happy` Looks up the definition of the word "happy"', '`lookup happy s` Looks up synonyms for the word "happy"', '`lookup happy a` Looks up antonyms for the word "happy"'],
            args: [
                {
                    key: 'word',
                    prompt: 'What word would you like to look up?',
                    type: 'string'
                },
                {
                    key: 'flag',
                    default: 'd',
                    prompt: '',
                    type: 'string'
                }
            ],
            throttling: {
                usages: 2,
                duration: 10
            }
        });
    }

    run(msg, {word, flag}) {
        
        flag = flag.toLowerCase();
        
        var type = 'definitions';
        var url = 'https://od-api.oxforddictionaries.com:443/api/v1/entries/en/'+word;
        
        // Synonyms
        if (flag === 's'){
            type = 'synonyms';
            url += '/synonyms';
        } else if (flag === 'a'){
            type = 'antonyms';
            url += '/antonyms';
        }
        
        var message = '';

        message += '**'+word+'** ['+type+']\n\n';

        // Call oxford didctionary API
        axios.get(url, {
            headers: {
                app_id: settings.oxford_id,
                app_key: settings.oxford_key
            }
        })
          .then(response => {

                var results = response.data.results[0].lexicalEntries;
                var output = {};

                // Build results
                for (var i = 0; i < results.length; i++){
                    
                    var lexicalEntry = results[i];
                    var lexicalCategory = lexicalEntry.lexicalCategory;
                    var entries = lexicalEntry.entries[0].senses;
                    output[lexicalCategory] = new Array();
                    
                    // Synonyms
                    if (type === 'synonyms'){
                                                
                        output[lexicalCategory]['examples'] = new Array();
                        output[lexicalCategory]['results'] = new Array();

                                                
                        for (var k = 0; k < entries.length; k++){

                            var entry = entries[k];                                                        
                            
                            if (entry.synonyms !== undefined){
                                
                                // Examples
                                var example = entry.examples[0];
                                output[lexicalCategory]['examples'][k] = example.text;
                                output[lexicalCategory]['results'][k] = new Array();
                                
                                for (var j = 0; j < entry.synonyms.length; j++){
                                    
                                    output[lexicalCategory]['results'][k].push(entry.synonyms[j].text);
                                    
                                }
                                
                            }

                        }
                        
                    } else if (type === 'antonyms'){
                        
                        output[lexicalCategory]['examples'] = new Array();
                        output[lexicalCategory]['results'] = new Array();

                                                
                        for (var k = 0; k < entries.length; k++){

                            var entry = entries[k];                                                        
                            
                            if (entry.antonyms !== undefined){
                                
                                // Examples
                                var example = entry.examples[0];
                                output[lexicalCategory]['examples'][k] = example.text;
                                output[lexicalCategory]['results'][k] = new Array();
                                
                                for (var j = 0; j < entry.antonyms.length; j++){
                                    
                                    output[lexicalCategory]['results'][k].push(entry.antonyms[j].text);
                                    
                                }
                                
                            }

                        }
                        
                    } else {
                    
                        // Definitions                    
                        for (var k = 0; k < entries.length; k++){

                            var entry = entries[k];                                                        

                            if (entry.definitions !== undefined && entry.short_definitions !== undefined){
                                output[lexicalCategory].push(entry.definitions);
                            }

                        }

                    }

                }
                
                // Build message
                for (var key in output){

                    message += '('+key+')\n';
                    
                    // Synonymns
                    if (type === 'synonyms' || type === 'antonyms'){

                        // Loop through examples
                        for (var ek = 0; ek < output[key]['examples'].length; ek++){

                            message += (ek+1) + '. "' + output[key]['examples'][ek] + '":\n';
                            message += '*' + output[key]['results'][ek].join(', ') + '*\n\n';

                        }                        

                    } else {
                    
                        // Definitions
                        for (var i = 0; i < output[key].length; i++){
                            message += '- ' + output[key][i] + '\n';
                        }
                    
                    }
                    
                    message += '\n';

                }

                msg.say(message);

          })
          .catch(error => {
                msg.say('Could not lookup word. Error message: ' + error);
          });
        
        
    }
};