exports.run = async (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {

    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed);

    if(message.author.id === config.botOwner) {
        if(args.length >= 2) {
            if (args.length <= 2) {
                if (message.mentions.roles.first()) {
                    if (message.mentions.members.first()) {
                        
                        const loggingChannel = bot.channels.get(config.loggingChannel);

                        async function addRole() {
                            try {

                                let role = message.mentions.roles.first();            
                                let member = message.mentions.members.first();

                                member.addRole(role);

                                let successEmbed = new discord.RichEmbed()
                                    .setColor(0xB8E986)
                                    .setTitle('✅ Operación completada')
                                    .setDescription('Añadiste el rol ' +  args[0] + ' al usuario **' + args[1] + '**.');
                                message.channel.send(successEmbed);

                                let loggingEmbed = new discord.RichEmbed()
                                    .setColor(0x4A90E2)
                                    .setTimestamp()
                                    .setFooter(bot.user.username, bot.user.avatarURL)
                                    .setTitle('📑 Auditoría')
                                    .setDescription('Se ha proporcionado un nuevo rol.')
                                    .addField('Fecha:', new Date().toUTCString(), true)
                                    .addField('Emisor:', '<@' + message.author.id + '>', true)
                                    .addField('Rol:', args[0], true)
                                    .addField('Destino (ID)', args[1], true)
                                await loggingChannel.send(loggingEmbed);

                                console.log('\n 》' + message.author.username + ' añadió el rol ' + message.mentions.roles.first().name + ' al usuario ' + args[1] + '.');

                            } catch (e) {
                                console.error(new Date().toUTCString() + ' 》' + e);
                                let errorEmbed = new discord.RichEmbed()
                                    .setColor(0xF12F49)
                                    .setTitle('❌ Ocurrió un error')
                                    .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
                                message.channel.send(errorEmbed);
                                return;
                            }
                        }
                        addRole();
                    } else {
                        console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó un usuario válido para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

                        let errorEmbed = new discord.RichEmbed()
                            .setColor(0xF12F49)
                            .setDescription('❌ No has mencionado un usuario válido');
                        message.channel.send(errorEmbed);
                    }
                } else {
                    console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó un rol válido para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

                    let errorEmbed = new discord.RichEmbed()
                        .setColor(0xF12F49)
                        .setDescription('❌ No has mencionado un rol válido');
                    message.channel.send(errorEmbed);
                }
            } else {
                console.log (new Date().toUTCString() + ' 》' + message.author.username + ' proporcionó demasiados argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

                let errorEmbed = new discord.RichEmbed()
                    .setColor(0xF12F49)
                    .setDescription('❌ Proporcionaste demasiados argumentos.\nTan solo debes escribir el rol y el usuario que lo recibirá');
                message.channel.send(errorEmbed);
            }
        } else {
            console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ Debes escribir el rol y el usuario que lo recibirá');
            message.channel.send(errorEmbed);
        }
    } else if (message.member.roles.has(config.botSupervisor)) {
        if(args.length >= 2) {
            if (args.length <= 2) {
                if (message.mentions.roles.first()) {
                    if (message.mentions.members.first()) {
                        
                        const loggingChannel = bot.channels.get(config.loggingChannel);

                        async function addRole() {
                            try {

                                let role = message.mentions.roles.first();
                                let member = message.mentions.members.first();
                                let roleID = args[0].slice(3, -1);
                                
                                if (roleID === roles.iniciados || roleID === roles.profesionales || roleID === roles.veteranos || roleID === roles.expertos) {
                                    member.addRole(role);
                                } else {
                                    console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no dispone de privilegios suficientes para otorgar el rol ' + message.mentions.roles.first() + ' en ' + message.guild.name);

                                    let errorEmbed = new discord.RichEmbed()
                                        .setColor(0xF12F49)
                                        .setTitle('❌ Ocurrió un error')
                                        .setDescription('❌ ' + message.author.username + ', no dispones de privilegios suficientes para otorgar este rol');
                                    message.channel.send(errorEmbed);
                                    return;
                                }

                                let successEmbed = new discord.RichEmbed()
                                    .setColor(0xB8E986)
                                    .setTitle('✅ Operación completada')
                                    .setDescription('Añadiste el rol ' +  args[0] + ' al usuario **' + args[1] + '**.');
                                message.channel.send(successEmbed);

                                let loggingEmbed = new discord.RichEmbed()
                                    .setColor(0x4A90E2)
                                    .setTimestamp()
                                    .setFooter(bot.user.username, bot.user.avatarURL)
                                    .setTitle('📑 Auditoría')
                                    .setDescription('Se ha proporcionado un nuevo rol.')
                                    .addField('Fecha:', new Date().toUTCString(), true)
                                    .addField('Emisor:', '<@' + message.author.id + '>', true)
                                    .addField('Rol:', args[0], true)
                                    .addField('Destino (ID)', args[1], true)
                                await loggingChannel.send(loggingEmbed);

                                console.log('\n 》' + message.author.username + ' añadió el rol ' + message.mentions.roles.first().name + ' al usuario ' + args[1] + '.');

                            } catch (e) {
                                console.error(new Date().toUTCString() + ' 》' + e);
                                let errorEmbed = new discord.RichEmbed()
                                    .setColor(0xF12F49)
                                    .setTitle('❌ Ocurrió un error')
                                    .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
                                message.channel.send(errorEmbed);
                                return;
                            }
                        }
                        addRole();
                    } else {
                        console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó un usuario válido para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

                        let errorEmbed = new discord.RichEmbed()
                            .setColor(0xF12F49)
                            .setDescription('❌ No has mencionado un usuario válido');
                        message.channel.send(errorEmbed);
                    }
                } else {
                    console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó un rol válido para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

                    let errorEmbed = new discord.RichEmbed()
                        .setColor(0xF12F49)
                        .setDescription('❌ No has mencionado un rol válido');
                    message.channel.send(errorEmbed);
                }
            } else {
                console.log (new Date().toUTCString() + ' 》' + message.author.username + ' proporcionó demasiados argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

                let errorEmbed = new discord.RichEmbed()
                    .setColor(0xF12F49)
                    .setDescription('❌ Proporcionaste demasiados argumentos.\nTan solo debes escribir el rol y el usuario que lo recibirá');
                message.channel.send(errorEmbed);
            }
        } else {
            console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ Debes escribir el rol y el usuario que lo recibirá');
            message.channel.send(errorEmbed);
        }
    } else {
        return console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no dispone de privilegios suficientes para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);
    }
}
