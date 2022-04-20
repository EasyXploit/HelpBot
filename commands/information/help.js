exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {

        //Si se proporciona un parámetro
        if (args[0]) {
            
            //Obtiene el export del comando, o del alias
            let command = client.commands.get(args[0]);
            if (!command) command = client.commands.get(client.aliases.get(args[0]));

            //Comprueba si el comando existe
            if (!command) return message.channel.send({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.nonexistentCommand, { cmd: args[0] })}.`)
            ]});

            //Comprueba si el miembro tiene permiso para ejecutar el comando
            if (!await client.functions.checkCommandPermission(message, client.config.commands[command.config.name])) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.nonPrivileged, { messageAuthor: message.author })}.`)]
            });

            //Obtiene la configuración del comando
            let commandConfig = command.config;

            //Almacena los alias del comando
            const commandAliases = commandConfig.aliases.concat(client.config.commands[commandConfig.name].additionalAliases);

            //Almacena las traducciones del comando al idioma configurado
            const commandLocale = await require(`../../resources/locales/${client.config.main.language}.json`).commands[commandConfig.category][commandConfig.name];
    
            //Genera un embed para la lista de comandos
            let helpEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setThumbnail('attachment://help.png')
                .setTitle(`${client.functions.localeParser(locale.helpEmbed.command, { commandName: commandConfig.name })}:`)
                .addField(`${locale.helpEmbed.description} 🧭`, commandLocale.description || locale.helpEmbed.noDescription)
                .addField(`${locale.helpEmbed.alias} 👥`, `${commandAliases.length > 0 ? commandAliases.join(', ') : locale.helpEmbed.noAlias}`)
                .addField(`${locale.helpEmbed.syntax} ⌨`, `\`${client.config.main.prefix}${commandConfig.name}${commandLocale.parameters.length > 0 ? ' ' + commandLocale.parameters : ''}\``)
                .addField(`${locale.helpEmbed.notationTitle} ✍️`, locale.helpEmbed.notation);

            //Envía el embed de ayuda
            await message.channel.send({ embeds: [ helpEmbed ], files: ['./resources/images/help.png'] });

        } else { //Si no se proporciona un parámetro

            //Genera un embed para la lista de comandos
            let commandListEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setThumbnail('attachment://help.png')
                .setAuthor({ name: client.functions.localeParser(locale.commandListEmbed.author, { botUsername: client.user.username }), iconURL: client.user.displayAvatarURL({dynamic: true})})
                .setFooter({ text: client.functions.localeParser(locale.commandListEmbed.footer, { prefix: client.config.main.prefix }) });

            //Almacena las traducciones de los comandos
            const translations = require(`../../resources/locales/${client.config.main.language}.json`).commands;

            //Examina cada directorio "categoría" de comandos
            for (let category of await client.fs.readdirSync('./commands/')) {

                //Almacena la lista de comandos de la categoría
                let commands = [];

                //Para cada comando de dicha categoría
                for (let command of await client.fs.readdirSync(`./commands/${category}/`)) {

                    //Elimina la extensión del archivo
                    command = command.replace('.js', '');

                    //Comprueba si el miembro tiene permiso para ejecutar el comando
                    if (!await client.functions.checkCommandPermission(message, client.config.commands[command])) continue;

                    //Añade el comando al array
                    commands.push(command);
                };

                //Omite la categoría si no hay comandos habilitados para el miembro
                if (commands.length === 0) continue;

                //Añade un campo al embed con la categoría y sus comandos
                await commandListEmbed.addField(`${translations[category].categoryName}:`, `\`${commands.join('`, `')}\``);
            };

            //Envía el embed de ayuda
            await message.channel.send({ embeds: [ commandListEmbed ], files: ['./resources/images/help.png'] });
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'help',
    aliases: ['commands', 'command', 'cmds', 'cmd', '?'],
};
