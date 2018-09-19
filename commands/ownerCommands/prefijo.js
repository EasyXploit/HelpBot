exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {

    if(args.length >= 2) {
        if (args.length <= 2) {

            async function changePrefix() {
                try {
                    
                    let tooLongEmbed = new discord.RichEmbed()
                        .setColor(0xF12F49)
                        .setDescription('❌ Debes proporcionar un prefijo cuya lonjitud sea de 1 carácter');
                    
                    let actuallyConfiguredEmbed = new discord.RichEmbed()
                        .setColor(0xF12F49)
                        .setDescription('❌ Este prefijo ya ha sido configurado');
                    
                    const newPrefix = message.content.split(" ").slice(1, 2)[0];
                    if (newPrefix.length > 1) return message.channel.send(tooLongEmbed);
                    let prefixType = 'null';
                    
                    switch (args[1]) {
                        case 'todos':
                            prefixType = 'general';
                            break;
                        case 'staff':
                            prefixType = 'del staff';
                            break;
                        case 'supervisores':
                            prefixType = 'de los supervisores';
                            break;
                        case 'owner':
                            prefixType = 'del owner';
                            break;
                        default:
                            let errorEmbed = new discord.RichEmbed()
                                .setColor(0xF12F49)
                                .setDescription('❌ Debes el tipo de prefijo a sustituir\nEj.: ` ' + config.ownerPrefix+ 'prefijo & supervisores`');
                            return message.channel.send(errorEmbed);
                            break;
                    }
                    
                    let loggingEmbed = new discord.RichEmbed()
                        .setColor(0x4A90E2)
                        .setTimestamp()
                        .setFooter(bot.user.username, bot.user.avatarURL)
                        .setTitle('📑 Auditoría')
                        .setDescription(message.author.username + ' cambió el prefijo ' + prefixType + ' a `' + newPrefix + '`');
                    
                    let successEmbed = new discord.RichEmbed()
                        .setColor(0xB8E986)
                        .setTitle('✅ Operación completada')
                        .setDescription('Cambiaste el prefijo ' + prefixType + ' a `' + newPrefix + '`');

                    if (args[1] === 'todos') {
                        if (newPrefix === config.prefix) return message.channel.send(actuallyConfiguredEmbed);
                        config.prefix = newPrefix;
                        await fs.writeFile('./config.json', JSON.stringify(config), (err) => console.error);
                        prefixType = 'general';
                        loggingChannel.send(loggingEmbed);
                        message.channel.send(successEmbed);
                    } else if (args[1] === 'staff') {
                        if (newPrefix === config.staffPrefix) return message.channel.send(actuallyConfiguredEmbed);
                        config.staffPrefix = newPrefix;
                        await fs.writeFile('./config.json', JSON.stringify(config), (err) => console.error);
                        prefixType = 'del staff';
                        loggingChannel.send(loggingEmbed);
                        message.channel.send(successEmbed);
                    } else if (args[1] === 'supervisores') {
                        if (newPrefix === config.supervisorsPrefix) return message.channel.send(actuallyConfiguredEmbed);
                        config.supervisorsPrefix = newPrefix;
                        await fs.writeFile('./config.json', JSON.stringify(config), (err) => console.error);
                        prefixType = 'de los supervisores';
                        loggingChannel.send(loggingEmbed);
                        message.channel.send(successEmbed);
                    } else if (args[1] === 'owner') {
                        if (newPrefix === config.ownerPrefix) return message.channel.send(actuallyConfiguredEmbed);
                        config.ownerprefix = newPrefix;
                        await fs.writeFile('./config.json', JSON.stringify(config), (err) => console.error);
                        prefixType = 'del owner';
                        loggingChannel.send(loggingEmbed);
                        message.channel.send(successEmbed);
                    } else {
                        let errorEmbed = new discord.RichEmbed()
                            .setColor(0xF12F49)
                            .setDescription('❌ Debes el tipo de prefijo a sustituir\nEj.: ` ' + config.ownerPrefix+ 'prefijo & supervisores`');
                        return message.channel.send(errorEmbed);
                    } 
                } catch (e) {
                    console.error(new Date().toUTCString() + ' 》' + e);
                    let errorEmbed = new discord.RichEmbed()
                        .setColor(0xF12F49)
                        .setTitle('❌ Ocurrió un error')
                        .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
                    message.channel.send(errorEmbed);
                }
            }
            changePrefix();
        } else {
            console.log (new Date().toUTCString() + ' 》' + message.author.username + ' proporcionó demasiados argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ Tan solo debes proporcionar un prefijo (de 1 carácter de longitud) y el tipo de prefijo a sustituir\nEj.: ` ' + config.ownerPrefix+ 'prefijo & supervisores`');
            message.channel.send(errorEmbed);
        }
    } else {
        console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ Debes proporcionar un prefijo (de 1 carácter de longitud) y el tipo de prefijo a sustituir\nEj.: ` ' + config.ownerPrefix+ 'prefijo & supervisores`');
        message.channel.send(errorEmbed);
    }
}
