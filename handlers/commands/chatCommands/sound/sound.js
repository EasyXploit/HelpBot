//Librería para gestionar el sistema de archivos
const fs = require('fs');

//Almacena los nombres originales de los archivos
let fileNames = fs.readdirSync('./media/audios/');

//Almacena los nombres sin extensión
let soundList = [];

//Para cada archivo, almacena su nombre sin extensión en el array "soundList"
for (let file = 0; file < fileNames.length; file ++) soundList.push(fileNames[file].replace('.mp3', ''));

//Exporta la función para ser ejecutada
exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Si se desea obtener la lista
        if (interaction.options._subcommand === locale.appData.options.list.name) {

            //Envía una lista con las grabaciones
            interaction.reply({embeds : [ new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(`🎙 ${locale.soundListEmbed.title}`)
                .setDescription(`\`\`\`${soundList.join('    ')}\`\`\``)
            ]});

        //Si se desea subir un nuevo audio
        } else if (interaction.options._subcommand === locale.appData.options.upload.name) {

            //Almacena la URL del fichero adjunto
            const url = interaction.options._hoistedOptions[0].attachment.url;

            //Si el fichero no tiene extensión .mp3, devuelve un error
            if (!url.endsWith('.mp3')) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} El fichero debe tener extensión \`.mp3\`.`)
            ], ephemeral: true});

            //Almacena el nombre que tendrá el fichero del audio
            let fileName = interaction.options._hoistedOptions[1] ? `${interaction.options._hoistedOptions[1].value}.mp3` : url.split('/').pop();

            //Almacena el nombre que tendrá el audio
            let audioName = fileName.split('.').shift();

            //Si se excedió el tamaño máximo para el nombre
            if (fileName.length > 20) {

                //Recorta el nombre del audio
                audioName = audioName.slice(0, 20);

                //Regenera el nombre del fichero
                fileName = `${audioName}.mp3`
            };

            //Comprueba si ya existía un audio con ese nombre
            if (soundList.includes(audioName)) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} Ya existe un audio con el nombre \`${audioName}\`.`)
            ], ephemeral: true});

            //Pospone la respuesta del bot
            await interaction.deferReply();
            
            //Carga el módulo para hacer consultas HTTPS
            const https = require('https');

            //Consulta la URL del fichero adjunto
            https.get(url, async response => {

                //Almacena el tamaño del archivo 
                const fileSize = response.headers['content-length'];

                //Devuelve un error si se ha superado el tamaño máximo de archivo
                if (fileSize > commandConfig.maxFileSize) return interaction.editReply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} El tamaño máximo de archivo es de \`${await client.functions.formatBytes(commandConfig.maxFileSize)}\`.`)
                ]});

                //Crea un nuevo archivo local
                const file = client.fs.createWriteStream(`./media/audios/${fileName}`);

                //Redirige el contenido del fichero remoto al nuevo fichero local
                response.pipe(file);

                //Cuando el volcado finalice
                file.on('finish', async () => {

                    //Cierra el archivo
                    file.close();

                    //Carga el módulo para hacer obtener la duración del fichero
                    const getMP3Duration = require('get-mp3-duration');

                    //Carga el fichero para comrpobar su duración
			        const fileBuffer = await client.fs.readFileSync(`./media/audios/${fileName}`);

                    //Almacena la duración del fichero
                    let duration = await getMP3Duration(fileBuffer);

                    //Si la duración excede el máximo permitido
                    if (duration > commandConfig.maxDuration) {

                        //Borra el fichero del audio
                        await client.fs.unlink(`./media/audios/${fileName}`, (error) => {

                            //Si hubo un error, lo devuelve
                            if (error) throw error;
                        });

                        //Devuelve un error al usuario
                        return interaction.editReply({ embeds: [ new client.MessageEmbed()
                            .setColor(client.config.colors.error)
                            .setDescription(`${client.customEmojis.redTick} La duración máxima permitida es \`${await client.functions.msToTime(commandConfig.maxDuration)}\`.`)
                        ]});
                    };

                    //Actualiza la lista de audios
                    this.config.soundList.push(audioName);

                    //Envía un registro al canal de registro
                    await client.functions.loggingManager('embed', new client.MessageEmbed()
                        .setColor(client.config.colors.logging)
                        .setTitle(`📑 Registro - [AUDIO AÑADIDO]`)
                        .setDescription(`Se ha añadido un nuevo audio al directorio local`)
                        .addField('Miembro', interaction.user.tag, true)
                        .addField('Nombre', audioName, true)
                    );

                    //Responde a la interacción con una confirmación
                    await interaction.editReply({ embeds: [ new client.MessageEmbed()
                        .setColor(client.config.colors.correct)
                        .setDescription(`${client.customEmojis.greenTick} El audio \`${audioName}\` ha sido almacenado correctamente.`)
                    ]});
                });
            });

        //Si se desea eliminar un audio existente
        } else if (interaction.options._subcommand === locale.appData.options.remove.name) {

            //Almacena si el miembro puede eliminar audios, en función de si tiene permisos o no
            let authorized = interaction.member.id === interaction.guild.ownerId || interaction.member.roles.cache.find(role => role.id === client.config.main.botManagerRole);

            //Para cada ID de rol de la lista blanca
            if (!authorized) for (let index = 0; index < commandConfig.canRemove.length; index++) {

                //Si uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (interaction.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || interaction.member.roles.cache.find(role => role.id === commandConfig.canRemove[index])) {
                    authorized = true;
                    break;
                };
            };

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} No tienes permiso para eliminar audios.`)
            ], ephemeral: true});

            //Almacena la selección del usuario
            const audioName = interaction.options._hoistedOptions[0].value;

            //Borra el fichero del audio
            await client.fs.unlink(`./media/audios/${audioName}.mp3`, (error) => {

                //Si hubo un error, lo devuelve
                if (error) throw error;
            });

            //Elimina la entrada de la lista
            this.config.soundList.splice(this.config.soundList.indexOf(audioName), 1);

            //Envía un registro al canal de registro
            await client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle(`📑 Registro - [AUDIO ELIMINADO]`)
                .setDescription(`Se ha eliminado un audio almacenado localmente`)
                .addField('Miembro', interaction.user.tag, true)
                .addField('Nombre', audioName, true)
            );

            //Responde a la interacción con una confirmación
            await interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setDescription(`${client.customEmojis.greenTick} El audio \`${audioName}\` ha sido eliminado correctamente.`)
            ]});
        
        } else { //Si se desea reproducir una grabación

            //Almacena la selección proporcionada por el usuario, o una aleatoria
            const selection = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : soundList[Math.floor(Math.random() * soundList.length)];

            //Comprueba los requisitos previos para el comando
            if (!await require('../../../../utils/voice/preChecks.js').run(client, interaction, ['user-connection',  'forbidden-channel',  'can-speak', 'not-afk',  'can-join',  'full-channel'])) return;

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];

            //Comprueba si no hay cola y si el miembro está el mismo canal que el bot
            if (reproductionQueue && interaction.guild.me.voice.channelId && interaction.guild.me.voice.channelId !== interaction.member.voice.channelId) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyPlaying}.`)
            ], ephemeral: true});

            //Si la grabación no existe, devuelve un error
            if (!soundList.includes(selection)) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.doesntExist, { recordName: selection })}.`)
            ], ephemeral: true});

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            await require('../../../../utils/voice/fetchResource.js').run(client, interaction, 'file', selection);

            //Almacena librerías necesarios para manejar conexiones de voz
            const { getVoiceConnection, joinVoiceChannel } = require('@discordjs/voice');

            //Obtiene la conexión de voz actual
            let connection = await getVoiceConnection(interaction.guild.id);

            //Almacena librerías necesarios para manejar estados de conexiones
            const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');

            //Manda un mensaje de notificación de la carga
            interaction.reply({ content: `⌛ | ${client.functions.localeParser(locale.loadingFile, { fileName: selection })}.` });

            //Si ya había conexión y el reproductor estaba a la espera, solo ejecuta el mediaPlayer
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'idle') return require('../../../../utils/voice/mediaPlayer.js').run(client, interaction, connection);

            //Omite si ya hay reproducción en curso
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'playing') return;

            //Almacena el canal de voz del miembro
            const voiceChannel = interaction.member.voice.channel;

            //Crea una nueva conexión al canal de miembro
            connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            //Almacena el canal de texto de la interacción
            const interactionChannel = await client.functions.fetchChannel(interaction.channelId);

            //Manda un mensaje de confirmación
            interactionChannel.send({ content: `📥 | ${client.functions.localeParser(locale.bounded, { voiceChannel: voiceChannel, textChannel: interactionChannel })}.` });

            //Si la conexión desaparece
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    //Comprueba si solo se trataba de una reconexión a otro canal, para ignorarlo
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
                    ]);
                } catch (error) {//Parece ser una desconexión real de la que no debe recuperarse

                    //Aborta la conexión
                    connection.destroy();

                    //Borra la información de reproducción de la guild
                    delete client.reproductionQueues[interaction.guild.id];
                }
            });

            //Espera un máximo de 5 segundos hasta que la conexión de voz esté lista
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

            //Ejecuta el reproductor de medios
            require('../../../../utils/voice/mediaPlayer.js').run(client, interaction, connection);
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

//Exporta la función de autocompletado
exports.autocomplete = async (client, interaction, command, locale) => {

    try {

        //Almacena el valor parcial que ha introducido el usuario
        const focusedValue = interaction.options.getFocused();

        //Filtra la lista de audios en base al valor parcial
        let filtered = command.config.soundList.filter(audio => audio.startsWith(focusedValue));

        //Aleatoriza y recorta la lista de audios
        filtered = await client.functions.getMultipleRandom(filtered, 25);

        //Responde a la interacción con la lista
        await interaction.respond(filtered.map(audio => ({ name: audio, value: audio })));

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

//Exporta la configuración del comando
module.exports.config = {
    type: 'guild',
    defaultPermission: true,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'list',
                type: 'SUB_COMMAND'
            },
            {
                optionName: 'play',
                type: 'SUB_COMMAND',
                options: [
                    {
                        optionName: 'selection',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                optionName: 'random',
                type: 'SUB_COMMAND'
            },
            {
                optionName: 'upload',
                type: 'SUB_COMMAND',
                options: [
                    {
                        optionName: 'attachment',
                        type: 'ATTACHMENT',
                        required: true
                    },
                    
                    {
                        optionName: 'name',
                        type: 'STRING',
                        required: false
                    }
                ]
            },
            {
                optionName: 'remove',
                type: 'SUB_COMMAND',
                options: [
                    {
                        optionName: 'selection',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            }
        ]
    },
    soundList: soundList
};
