exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-dm (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)
    
    try {
        
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(resources.RedTick + ' La sintaxis de este comando es `' + config.ownerPrefix + 'dm (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)`');
        
        let noToDMEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(resources.RedTick + ' No has proporcionado el contenido del mensaje');
        
        let confirmEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setDescription(resources.GreenTick + ' ¡Mensaje enviado!');
        
        if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);
        
        if (args[0] !== 'autor' && args[0] !== 'anonimo' && args[0] !== 'broadcast') return message.channel.send(noCorrectSyntaxEmbed);
        
        let type = args[0];
        
        if (args[0] === 'autor' || args[0] === 'anonimo') {
            
            let noUserEmbed = new discord.RichEmbed()
                .setColor(0xF04647)
                .setDescription(resources.RedTick + ' No has proporcionado un usuario válido');
            
            let noBotsEmbed = new discord.RichEmbed()
                .setColor(0xF04647)
                .setDescription(resources.RedTick + ' No puedes entablar una conversación con un bot');
            
            let member = await message.guild.fetchMember(message.mentions.users.first() || args[1]);
            if (!member) return message.channel.send(noUserEmbed);
            let user = member.user
            
            if (user.bot) return message.channel.send(noBotsEmbed);
            
            let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
            let toDM = message.content.slice(toDeleteCount)
            if (!toDM) return message.channel.send(noToDMEmbed);
            
            let resultEmbed;
            
            switch (type) {
                case 'autor':
                    resultEmbed = new discord.RichEmbed()
                        .setAuthor('Mensaje de: ' + message.author.username, message.author.avatarURL)
                        .setColor(0xFFC857)
                        .setDescription(toDM);
                
                    await message.delete()
                    await user.send(resultEmbed);
                    await message.channel.send(confirmEmbed);
                    break;
                case 'anonimo':
                    if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
                    
                    resultEmbed = new discord.RichEmbed()
                        .setColor(0xFFC857)
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
            
            let resultEmbed = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setDescription(toDM);
            
            let sendingEmbed = new discord.RichEmbed()
                .setColor(0xB8E986)
                .setDescription(resources.GreenTick + ' El mensaje está siendo enviado');
            
            await message.delete()
            await message.channel.send(sendingEmbed);
            
            //Envia el mensaje a cada usuario
            message.guild.members.forEach( async m => {
                if (m.user.bot) return;
                await m.user.send(resultEmbed);
            });
            
            await message.channel.send(confirmEmbed);
        }
    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
