exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //$prefix (nuevo prefijo) (todos | staff | owner)

    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' La sintaxis de este comando es: `' + config.ownerPrefix+ 'prefix (nuevo prefijo) (todos | staff | owner)`');

        //Comprueba si se han proporcionado todos los argumentos
        if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);

        //Se extrae el prefijo de los argumentos
        const newPrefix = message.content.split(" ").slice(1, 2)[0];
        
        let tooLongEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar un prefijo cuya longitud sea de 1 carácter');
        
        //Se comprueba si el prefijo tiene una longitud de 1 carácter
        if (newPrefix.length !== 1) return message.channel.send(tooLongEmbed);
        
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
        
        let actuallyConfiguredEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Este prefijo ya ha sido configurado');
        
        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(resources.GreenTick + ' Operación completada')
            .setDescription('Cambiaste el prefijo ' + prefixType + ' a `' + newPrefix + '`');

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0x4A90E2)
            .setTimestamp()
            .setFooter(bot.user.username, bot.user.avatarURL)
            .setTitle('📑 Auditoría')
            .setDescription(message.author.username + ' cambió el prefijo ' + prefixType + ' a `' + newPrefix + '`');

        if (args[1] === 'todos') {
            if (newPrefix === config.prefix) return message.channel.send(actuallyConfiguredEmbed);
            
            //Graba el nuevo prefijo
            config.prefix = newPrefix;
            await fs.writeFile('./config.json', JSON.stringify(config, null, 4), (err) => console.error);
            
            prefixType = 'general';
            
            await loggingChannel.send(loggingEmbed);
            await message.channel.send(successEmbed);
        } else if (args[1] === 'staff') {
            if (newPrefix === config.staffPrefix) return message.channel.send(actuallyConfiguredEmbed);
            
            //Graba el nuevo prefijo
            config.staffPrefix = newPrefix;
            await fs.writeFile('./config.json', JSON.stringify(config, null, 4), (err) => console.error);
            
            prefixType = 'del staff';
            
            await loggingChannel.send(loggingEmbed);
            await message.channel.send(successEmbed);
        } else if (args[1] === 'owner') {
            if (newPrefix === config.ownerPrefix) return message.channel.send(actuallyConfiguredEmbed);
            
            //Graba el nuevo prefijo
            config.ownerPrefix = newPrefix;
            await fs.writeFile('./config.json', JSON.stringify(config, null, 4), (err) => console.error);
            
            prefixType = 'del owner';
            
            await loggingChannel.send(loggingEmbed);
            await message.channel.send(successEmbed);
        }
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
