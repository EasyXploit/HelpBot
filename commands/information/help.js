exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        //Si se proporciona un parámetro
        if (args[0]) {
            
            //Obtiene el export del comando, o del alias
            let command = client.commands.get(args[0]);
            if (!command) command = client.commands.get(client.aliases.get(args[0]));

            //Comprueba si el comando existe
            if (!command) return message.channel.send({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} El comando \`${args[0]}\` no existe.`)
            ]});

            //Comprueba si el miembro tiene permiso para ejecutar el comando
            if (!await client.functions.checkCommandPermission(message, client.config.commands[command.config.name])) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para usar este comando.`)]
            });

            //Obtiene la configuración del comando
            let commandConfig = command.config;

            //Almacena los alias adicionales del comando
            commandConfig.aliases = commandConfig.aliases.concat(client.config.commands[commandConfig.name].additionalAliases);
    
            //Genera un embed para la lista de comandos
            let helpEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setThumbnail('attachment://help.png')
                .setTitle(`Comando "${commandConfig.name}":`)
                .addField('Descripción 🧭', commandConfig.description || 'Ninguna')
                .addField('Alias 👥', `${commandConfig.aliases.length > 0 ? commandConfig.aliases.join(', ') : 'Ninguno'}`)
                .addField('Sintaxis ⌨', `\`${client.config.main.prefix}${commandConfig.name}${commandConfig.parameters.length > 0 ? ' ' + commandConfig.parameters : ''}\``)
                .addField('Notación de la sintaxis ✍️', '- Corchetes: _[argumento opcional]_\n- Corchetes angulares: _<argumento obligatorio>_\n- Llaves: _{argumento predeterminado}_\n- Paréntesis: _(información diversa)_\n- Comillas dobles: _"argumento de texto literal"_\n- Barra vertical: _posibilidad1 | posibilidad2_');

            //Envía el embed de ayuda
            await message.channel.send({ embeds: [ helpEmbed ], files: ['./resources/images/help.png'] });

        } else { //Si no se proporciona un parámetro

            //Genera un embed para la lista de comandos
            let helpEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setThumbnail('attachment://help.png')
                .setAuthor({ name: `Lista de comandos de ${client.user.username}`, iconURL: client.user.displayAvatarURL({dynamic: true})})
                .setFooter({ text: `Para aprender a utilizar un comando, escribe "${client.config.main.prefix}help <nombre del comando>".` });

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

                //Capitaliza el nombre de la categoría
                category = `🞄 ${category.charAt(0).toUpperCase()}${category.slice(1)}`;

                //Añade un campo al embed con la categoría y sus comandos
                await helpEmbed.addField(`${category}:`, `\`${commands.join('`, `')}\``);
            };

            //Envía el embed de ayuda
            await message.channel.send({ embeds: [ helpEmbed ], files: ['./resources/images/help.png'] });

        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'help',
    description: 'Muestra una lista con los comandos del bot, o la ayuda para uno solo.',
    aliases: ['commands', 'command', 'cmds', 'cmd', '?'],
    parameters: '[nombre del comando]'
};
