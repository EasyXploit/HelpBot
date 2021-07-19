exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!prefix (nuevo prefijo) (todos | staff | owner)

    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es: \`${client.config.guild.prefix}prefix (nuevo prefijo) (todos | staff | owner)\``);

        //Comprueba si se han proporcionado todos los argumentos
        if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);

        //Se extrae el prefijo de los argumentos
        const newPrefix = args[0];
        
        let tooLongEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un prefijo cuya longitud sea menor o igual a 3 carácteres`);
        
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
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Este prefijo ya ha sido configurado`);
        
        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`Cambiaste el prefijo ${prefixType} a \`${newPrefix}\``);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.blue)
            .setTitle('📑 Auditoría - [PREFIJO]')
            .setDescription(`${message.author.tag} cambió el prefijo ${prefixType} a \`${newPrefix}\``);

        if (args[1] === 'todos') {
            if (newPrefix === client.config.prefix || newPrefix === client.config.guild.prefix || newPrefix === client.config.guild.prefix) return message.channel.send(actuallyConfiguredEmbed);
            
            //Graba el nuevo prefijo
            client.config.prefix = newPrefix;
            await client.fs.writeFile('./configs/guild.json', JSON.stringify(client.config.guild, null, 4), (err) => console.error);
            
            prefixType = 'general';
            
            await client.functions.loggingManager(loggingEmbed);
            await message.channel.send(successEmbed);
        } else if (args[1] === 'staff') {
            if (newPrefix === client.config.prefix || newPrefix === client.config.guild.prefix || newPrefix === client.config.guild.prefix) return message.channel.send(actuallyConfiguredEmbed);
            
            //Graba el nuevo prefijo
            client.config.guild.prefix = newPrefix;
            await client.fs.writeFile('./configs/guild.json', JSON.stringify(client.config.guild, null, 4), (err) => console.error);
            
            prefixType = 'del staff';
            
            await client.functions.loggingManager(loggingEmbed);
            await message.channel.send(successEmbed);
        } else if (args[1] === 'owner') {
            if (newPrefix === client.config.prefix || newPrefix === client.config.guild.prefix || newPrefix === client.config.guild.prefix) return message.channel.send(actuallyConfiguredEmbed);
            
            //Graba el nuevo prefijo
            client.config.guild.prefix = newPrefix;
            await client.fs.writeFile('./configs/guild.json', JSON.stringify(client.config.guild, null, 4), (err) => console.error);
            
            prefixType = 'del owner';
            
            await client.functions.loggingManager(loggingEmbed);
            await message.channel.send(successEmbed);
        }
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};
