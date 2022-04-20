exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Comprueba si los parámetros se han proporcionado correctamente
        if ((args[0] && !['new', 'end'].includes(args[0])) || (args[0] && args[0] === 'end' && !args[1])) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Si hay que finalizar una encuesta
        if (args[0] === 'end') {

            //Busca la encuesta en la base de datos
            const pollData = client.db.polls[args[1]];

            //Si la encuesta no existe, devuelve un error
            if (!pollData) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.unknownPoll, { id: args[1] })}.`)
            ]});

            //Busca y almacena el canal de la encuesta
            const pollChannel = await client.functions.fetchChannel(message.guild, pollData.channel);

            //Busca y almacena el mensaje de la encuesta (si se pudo encontrar el canal)
            const pollMessage = pollChannel ? await client.functions.fetchMessage(pollData.message, pollChannel) : null;

            //Si el canal o el mensaje de la encuesta ya no existen
            if (!pollChannel || !pollMessage) {

                //Elimina la encuesta de la base de datos
                delete client.db.polls[args[1]];
            
                //Notifica del error al miembro
                return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryError)
                    .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.deletedPoll, { id: args[1] })}.`)
                ]});
            };

            //Comprueba, si corresponde, que el miembro tenga permiso para finalizar cualquier encuesta
            if (message.member.id !== pollData.author) {

                //Variable para saber si está autorizado
                let authorized;

                //Para cada ID de rol de la lista blanca
                for (let index = 0; index < commandConfig.canEndAny.length; index++) {

                    //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                    if (message.author.id === message.guild.ownerId || message.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || message.member.roles.cache.find(role => role.id === commandConfig.canEndAny[index])) {
                        authorized = true;
                        break;
                    };
                };

                //Si no se permitió la ejecución, manda un mensaje de error
                if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.onlyYours}.`)
                ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });
            };

            //Fuerza la expiración de la encuesta
            pollData.expiration = Date.now();

            //Sobreescribe el fichero de la base de datos con los cambios
            client.fs.writeFile('./databases/polls.json', JSON.stringify(client.db.polls), async err => {

                //Si hubo un error, lo lanza a la consola
                if (err) throw err;

                //Envía una confirmación al miembro
                return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryCorrect)
                    .setTitle(`${client.customEmojis.greenTick} ${locale.endedPollEmbed.title}`)
                    .setDescription(`${client.functions.localeParser(locale.endedPollEmbed.description, { poll: `[${pollData.title}](${pollMessage.url})`, pollChannel: pollChannel })}.`)
                ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });
            });

            //Aborta el resto del código
            return;
        };

        //Función para esperar mensajes del miembro
        async function awaitMessage(msg) {

            //Almacena el mensaje resultante
            let resultMessage;

            //Genera un filtro de mensajes
            const filter = msg => msg.author.id === message.author.id;

            //Espera mensajes en el canal
            await msg.channel.awaitMessages({filter, max: 1, time: 60000}).then(async collected => {

                //Almacena el contenido del primer resultado
                resultMessage = collected.first().content;

                //Elimina el mensaje pasados 2 segundos
                setTimeout(() => collected.first().delete(), 2000);

            }).catch(() => msg.delete()); //Aborta el colector si no se envían mensajes

            //Devuelve el mensaje capturado
            return resultMessage;
        };

        //Envía el assistantEmbed del título
        message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setTitle(`📊 ${locale.titleEmbed.title}`)
            .setDescription(locale.titleEmbed.description)
        ]}).then(async assistantEmbed => {

            //Espera un mensaje del miembro
            await awaitMessage(assistantEmbed).then(async title => {

                //Aborta si no hubo mensaje
                if (!title) return;

                //Edita el asistente para preguntar por la duración
                assistantEmbed.edit({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.primary)
                    .setTitle(`⏱ ${locale.durationEmbed.title}`)
                    .setDescription(locale.durationEmbed.description)
                ]});

                //Espera un mensaje del miembro
                await awaitMessage(assistantEmbed).then(async duration => {

                    //Aborta si no hubo mensaje
                    if (!duration) return;

                    //Si se proporcionó duración
                    if (duration !== '-') {

                        //Separa la duración en parámetros
                        const parameters = duration.split(' ');

                        //Convierte y almacena las magnitudes en milisegundos
                        duration = await client.functions.magnitudesToMs(parameters);

                        //Si no se puedieron obtener milisegundos
                        if (!duration) {

                            //Aborta el asistente
                            assistantEmbed.delete();

                            //Devuelve un error
                            return message.channel.send({ embeds: [ new client.MessageEmbed()
                                .setColor(client.config.colors.secondaryError)
                                .setDescription(`${client.customEmojis.redTick} ${locale.invalidDuration}.`)
                            ]});
                        };

                    } else duration = 0; //Si es indefinido, se establece "0" cómo duración

                    //Edita el asistente para preguntar por un campo
                    assistantEmbed.edit({ embeds: [ new client.MessageEmbed()
                        .setColor(client.config.colors.primary)
                        .setTitle(`:one: ${locale.firstFieldEmbed.title}`)
                        .setDescription(locale.firstFieldEmbed.description)
                    ]});

                    //Almacena los campos introducidos
                    let options = [];

                    //Almacena las opciones numeradas cómo emojis
                    const emojiOptions = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];

                    //Itera desde el 0 hasta el 9 (tope de campos)
                    for (let index = 0; index < 10; index++) {

                        //Espera un mensaje del miembro
                        await awaitMessage(assistantEmbed).then(async option => {

                            //Aborta si no hubo mensaje
                            if (!option) return;

                            //Almacena la opción en la lista de campos
                            options[index] = option;

                            //Edita el asistente para preguntar por otro campo
                            assistantEmbed.edit({ embeds: [ new client.MessageEmbed()
                                .setColor(client.config.colors.primary)
                                .setTitle(`${emojiOptions[index + 1]} ${locale.newFieldEmbed.title}`)
                                .setDescription(`${client.functions.localeParser(locale.newFieldEmbed.description, { remaining: 10 - index - 1 })}${ index > 0 ? `.\n${locale.newFieldEmbed.endAssistant}.` : ''}`)
                            ]});
                        });

                        

                        //Si no se ha proporcionado un campo, para el bucle
                        if (!options[index]) break;

                        //Si no se desea proporcionar más campos
                        if (options[index] === 'end' && options.length > 2) {

                            //Elimina el último campo almacenado
                            options.splice(-1,1);

                            //Para el bucle
                            break;
                        };
                    };

                    //Si no se proporcionaron suficientes campos, aborta
                    if (options.length < 2) return;

                    //Almacena las opciones formateadas
                    let formattedOptions = '';

                    //Por cada una de las opciones, la concatena formateada
                    for (count = 0; count < options.length; count++) formattedOptions += `${emojiOptions[count]} ${options[count]}\n\n`;

                    //Almacena el tiempo restante
                    let remainingTime = '∞';

                    //Si la duración es diferente de 0
                    if (duration !== 0) {

                        //Calcula el formato del tiempo restante
                        const remainingDays = Math.floor((duration) / (60 * 60 * 24 * 1000));
                        const remainingHours = Math.floor((duration - (remainingDays * 86400000)) / (60 * 60 * 1000));
                        const remainingMinutes = Math.floor((duration - (remainingHours * 3600000) - (remainingDays * 86400000)) / (60 * 1000));

                        //Almacena la cadena de tiempo restante
                        remainingTime = `${remainingDays}d ${remainingHours}h ${remainingMinutes}m`
                    };

                    //Almacena un nuevo ID para la encuesta
                    const pollId = client.functions.sidGenerator();
                    
                    //Envía la encuesta generada al canal de invocación
                    message.channel.send({ embeds: [ new client.MessageEmbed()
                        .setColor(client.config.colors.polls)
                        .setAuthor({ name: locale.pollEmbed.author, iconURL: 'attachment://poll.png' })
                        .setDescription(`**${title}**\n\n${formattedOptions}`)
                        .setFooter({ text: `ID: ${pollId} - ${locale.pollEmbed.duration}: ${remainingTime}` })
                    ], files: ['./resources/images/poll.png'] }).then(async pollEmbed => {

                        //Borra el embed del asistente
                        assistantEmbed.delete();

                        //Por cada una de las opciones
                        for (count = 0; count < options.length; count++) {

                            //Reacciona al embed con el el emoji adecuado
                            await pollEmbed.react([
                                '\u0031\u20E3',
                                '\u0032\u20E3',
                                '\u0033\u20E3',
                                '\u0034\u20E3',
                                '\u0035\u20E3',
                                '\u0036\u20E3',
                                '\u0037\u20E3',
                                '\u0038\u20E3',
                                '\u0039\u20E3',
                                '\uD83D\uDD1F'
                            ][count]);
                        };

                        //Almacena la encuesta en la base de datos
                        client.db.polls[pollId] = {
                            channel: message.channel.id,
                            message: pollEmbed.id,
                            author: message.author.id,
                            title: title,
                            options: formattedOptions
                        };

                        //Si la encuesta expira, almacena dicho timestamp
                        if (duration !== 0) client.db.polls[pollId].expiration = Date.now() + duration;
                
                        //Sobreescribe el fichero de la base de datos con los cambios
                        client.fs.writeFile('./databases/polls.json', JSON.stringify(client.db.polls, null, 4), async err => {

                            //Si hubo un error, lo lanza a la consola
                            if (err) throw err;
                        });
                        
                        //Envía un mensaje al canal de registros
                        await client.functions.loggingManager('embed', new client.MessageEmbed()
                            .setColor(client.config.colors.logging)
                            .setAuthor({ name: client.functions.localeParser(locale.loggingEmbed.author, { memberTag: message.member.user.tag }), iconURL: message.member.user.displayAvatarURL({dynamic: true}) })
                            .addField(locale.loggingEmbed.title, `__[${title}](${pollEmbed.url})__`, true)
                            .addField(locale.loggingEmbed.channel, `${message.channel}`, true)
                            .addField(locale.loggingEmbed.expiration, duration !== 0 ? `<t:${Math.round(new Date(parseInt(Date.now() + duration)) / 1000)}:R>` : locale.loggingEmbed.noExpiration, true)
                        );
                    });
                });
            });
        });

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'poll',
    aliases: []
};
