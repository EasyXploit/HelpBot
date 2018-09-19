exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {

    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed);
    return;

    if(args.length >= 3) {
        if (args.length <= 3) {
            if (message.mentions.roles.first()) {
                if (args[0].length === 18 || !args[0].match(/[a-z]/i)) {

                    async function setupRole() {
                        try {

                            //Sistema de reacción
                            let messageSetup = await message.channel.fetchMessage(args[0]);
                            await messageSetup.react(args[2]);


                            //Sistema de grabación
                            var role = {
                                "roles": []
                            };

                            role.roles.push({id: rolesSetup.roleCount + 1, roleName: args[2]});

                            await fs.writeFile('./rolesSetup.json', JSON.stringify(role), 'utf8');

                            var roleCount = rolesSetup.roleCount + 1;
                            rolesSetup.roleCount = roleCount;

                            await fs.writeFile('./rolesSetup.json', JSON.stringify(rolesSetup), (err) => console.error);
                            //- - - -

                            let successEmbed = new discord.RichEmbed()
                                .setColor(0xB8E986)
                                .setTitle('✅ Operación completada')
                                .setDescription('Instalaste el rol ' +  args[1] + ' en el mensaje **' + args[0] + '**.');
                            message.channel.send(successEmbed);

                            let loggingEmbed = new discord.RichEmbed()
                                .setColor(0x4A90E2)
                                .setTimestamp()
                                .setFooter(bot.user.username, bot.user.avatarURL)
                                .setTitle('📑 Auditoría')
                                .setDescription('Se ha instalado un nuevo rol configurable.')
                                .addField('Fecha:', new Date().toUTCString(), true)
                                .addField('Emisor:', '<@' + message.author.id + '>', true)
                                .addField('Rol:', args[1], true)
                                .addField('Destino (ID)', args[0], true)
                                .addField('Emoji:', args[2], true);
                            await loggingChannel.send(loggingEmbed);

                            console.log('\n 》' + message.author.username + ' instaló el rol ' + message.mentions.roles.first().name + ' en la lista de configuración de roles con ID ' + args[0] + '.');

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
                    setupRole();
                } else {
                    console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó un ID de canal de texto válido para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

                    let errorEmbed = new discord.RichEmbed()
                        .setColor(0xF12F49)
                        .setDescription('❌ No has proporcionado un ID de canal de texto válido');
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
                .setDescription('❌ Proporcionaste demasiados argumentos.\nTan solo debes escribir el ID del canal, el rol a asignar y su correspondiente emoji');
            message.channel.send(errorEmbed);
        }
    } else {
        console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ Debes escribir el ID del canal, el rol a asignar y su correspondiente emoji');
        message.channel.send(errorEmbed);
    }
}
