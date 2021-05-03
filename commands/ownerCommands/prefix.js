exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //$prefix (nuevo prefijo) (todos | staff | owner)

    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es: \`${config.ownerPrefix}prefix (nuevo prefijo) (todos | staff | owner)\``);

        //Comprueba si se han proporcionado todos los argumentos
        if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);

        //Se extrae el prefijo de los argumentos
        const newPrefix = args[0];
        
        let tooLongEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes proporcionar un prefijo cuya longitud sea menor o igual a 3 carácteres`);
        
        //Se comprueba si el prefijo tiene una longitud adecuada
        if (newPrefix.length > 3 || newPrefix.length < 1) return message.channel.send(tooLongEmbed);
        
        //Comprueba si se ha proporcionado correctamente el tipo de prefijo a sustituir
        if (args[1] !== 'todos' && args[1] !== 'staff' && args[1] !== 'owner') return message.channel.send(noCorrectSyntaxEmbed);
        
        let prefixType;

        switch (args[1]) {
            case 'todos':
                prefixType = 'general';
                break;
            case 'staff':
                prefixType = 'del staff';
                break;
            case 'owner':
                prefixType = 'del owner';
                break;
        }
        
        let actuallyConfiguredEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Este prefijo ya ha sido configurado`);
        
        let successEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`Cambiaste el prefijo ${prefixType} a \`${newPrefix}\``);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.blue)
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
            .setTitle('📑 Auditoría')
            .setDescription(`${message.author.username} cambió el prefijo ${prefixType} a \`${newPrefix}\``);

        if (args[1] === 'todos') {
            if (newPrefix === config.prefix || newPrefix === config.staffPrefix || newPrefix === config.ownerPrefix) return message.channel.send(actuallyConfiguredEmbed);
            
            //Graba el nuevo prefijo
            config.prefix = newPrefix;
            await fs.writeFile('./configs/config.json', JSON.stringify(config, null, 4), (err) => console.error);
            
            prefixType = 'general';
            
            await loggingChannel.send(loggingEmbed);
            await message.channel.send(successEmbed);
        } else if (args[1] === 'staff') {
            if (newPrefix === config.prefix || newPrefix === config.staffPrefix || newPrefix === config.ownerPrefix) return message.channel.send(actuallyConfiguredEmbed);
            
            //Graba el nuevo prefijo
            config.staffPrefix = newPrefix;
            await fs.writeFile('./configs/config.json', JSON.stringify(config, null, 4), (err) => console.error);
            
            prefixType = 'del staff';
            
            await loggingChannel.send(loggingEmbed);
            await message.channel.send(successEmbed);
        } else if (args[1] === 'owner') {
            if (newPrefix === config.prefix || newPrefix === config.staffPrefix || newPrefix === config.ownerPrefix) return message.channel.send(actuallyConfiguredEmbed);
            
            //Graba el nuevo prefijo
            config.ownerPrefix = newPrefix;
            await fs.writeFile('./configs/config.json', JSON.stringify(config, null, 4), (err) => console.error);
            
            prefixType = 'del owner';
            
            await loggingChannel.send(loggingEmbed);
            await message.channel.send(successEmbed);
        }
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
