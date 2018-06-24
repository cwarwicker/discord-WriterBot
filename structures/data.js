class Data
{
    
    constructor(guild)
    {
                
        // If there are no settings for this guild, create some
        if (guild.settings.get(guild.id) === undefined){
            guild.settings.set(guild.id, {});
        } 
        
        this.guild = guild;
        this.settings = guild.settings.get(guild.id);
        
    }
    
    g()
    {
        return this.settings;
    }
    
    s(value)
    {
        this.guild.settings.set(this.guild.id, value);      
    }
    
    
    
    
    
}

module.exports = Data;