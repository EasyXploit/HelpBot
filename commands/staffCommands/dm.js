exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-dm (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)
    
    try {
        
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.ownerPrefix}dm (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)\``);
        
        let noToDMEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} No has proporcionado el contenido del mensaje`);
        
        let confirmEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setDescription(`${resources.GreenTick} ¡Mensaje enviado!`);
        
        if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);
        
        if (args[0] !== 'autor' && args[0] !== 'anonimo' && args[0] !== 'broadcast') return message.channel.send(noCorrectSyntaxEmbed);
        
        let type = args[0];
        
        if (args[0] === 'autor' || args[0] === 'anonimo') {
            
            let noUserEmbed = new discord.MessageEmbed()
                .setColor(resources.red2)
                .setDescription(`${resources.RedTick} No has proporcionado un usuario válido`);
            
            let noBotsEmbed = new discord.MessageEmbed()
                .setColor(resources.red2)
                .setDescription(`${resources.RedTick} No puedes entablar una conversación con un bot`);
            
            const member = await resources.fetchMember(message.guild, args[1]);
            if (!member) return message.channel.send(noUserEmbed);
            let user = member.user
            
            if (user.bot) return message.channel.send(noBotsEmbed);
            
            let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
            let toDM = message.content.slice(toDeleteCount)
            if (!toDM) return message.channel.send(noToDMEmbed);
            
            let resultEmbed;
            
            switch (type) {
                case 'autor':
                    resultEmbed = new discord.MessageEmbed()
                        .setAuthor('Mensaje de: ' + message.author.username, message.author.avatarURL())
                        .setColor(resources.gold)
                        .setDescription(toDM);
                
                    await message.delete()
                    await user.send(resultEmbed);
                    await message.channel.send(confirmEmbed);
                    break;
                case 'anonimo':
                    if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
                    
                    resultEmbed = new discord.MessageEmbed()
                        .setColor(resources.gold)
                        .setDescription(toDM);
                
                    await message.delete()
                    await user.send(resultEmbed);
                    await message.channel.send(confirmEmbed);
                    break;
            }
            
            if (args.length < 3) return message.channel.send(noCorrectSyntaxEmbed);
            
        } else if (args[0] === 'broadcast') {
            
            if (message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed);
            
            //Comprueba si se ha proporcionado el cuerpo del mensaje
            let toDeleteCount = command.length - 2 + args[0].length + 2;
            let toDM = message.content.slice(toDeleteCount)
            if (!toDM) return message.channel.send(noToDMEmbed);
            
            let resultEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setDescription(toDM);
            
            let sendingEmbed = new discord.MessageEmbed()
                .setColor(resources.gray)
                .setDescription(`${resources.GrayTick} El mensaje está siendo enviado`);
            
            await message.delete()
            await message.channel.send(sendingEmbed);

            let i = 0;
            let interval = setInterval(function(){
                //if err throw err
                let member = message.guild.members.cache.array()[i]
                if (!member.user.bot) member.user.send(resultEmbed)
                    .then(console.log(`${new Date().toLocaleString()} 》Mensaje de broadcast enviado a ${member.user.tag}`));
                i++;
                if(i === message.guild.members.cache.array().length) {
                    clearInterval(interval);
                    message.channel.send(confirmEmbed);
                }
            }, 10000);
        }
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
