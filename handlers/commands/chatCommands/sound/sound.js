//Librería para gestionar el sistema de archivos
const fs = require('fs');

//Almacena los nombres originales de los archivos
let fileNames = fs.readdirSync('./storage/audios/');

//Almacena los nombres sin extensión
let soundList = [];

//Para cada archivo, almacena su nombre sin extensión en el array "soundList"
for (let file = 0; file < fileNames.length; file ++) soundList.push(fileNames[file].replace('.mp3', '').replace('.ogg', '').replace('.opus', ''));

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

            //Almacena si el miembro puede subir audios, en función de si tiene permisos o no
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canUpload});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantUpload}.`)
            ], ephemeral: true});

            //Almacena la URL del fichero adjunto
            const url = interaction.options._hoistedOptions[0].attachment.url;

            //Si el fichero no tiene extensión .mp3 o .ogg, devuelve un error
            if (!url.endsWith('.mp3') && !url.endsWith('.ogg') && !url.endsWith('.opus')) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.wrongFormat}.`)
            ], ephemeral: true});

            //Almacena el nombre que tendrá el fichero de audio
            const fileNameOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.upload.options.name.name);
            let fileName = fileNameOption ? `${fileNameOption.value}.${url.split('.').pop()}` : url.split('/').pop();

            //Requiere dependencias necesarias para calcular el tamaño del directorio de audios
            const { readdir, stat } = require('fs/promises');

            //Almacena los audios del directorio de auidos
            const files = await readdir( './storage/audios');

            //Obtiene la info. de cada uno de los archivos
            const stats = files.map(file => stat(`./storage/audios/${file}`));

            //Calcula el peso total del directorio en función del peso de todos los archivos
            const folderSize = (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);

            //Devuelve un error si se ha superado el tamaño máximo del directorio de audios
            if (folderSize > client.config.music.maxLocalAudiosFolderSize) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.maxDirectorySizeReached, { maxDirectorySize: `\`${await client.functions.utilities.formatBytes.run(client.config.music.maxLocalAudiosFolderSize)}\`` })}.`)
            ]});

            //Almacena el nombre que tendrá el audio
            let audioName = fileName.split('.').shift();

            //Si se excedió el tamaño máximo para el nombre
            if (fileName.length > 20) {

                //Recorta el nombre del audio
                audioName = audioName.slice(0, 20);

                //Regenera el nombre del fichero
                fileName = `${audioName}.${url.split('.').pop()}`
            };

            //Comprueba si ya existía un audio con ese nombre
            if (soundList.includes(audioName)) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.alreadyExists, { audioName: `\`${audioName}\`` })}.`)
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
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.maxFileSize, { maxFileSize: `\`${await client.functions.utilities.formatBytes.run(commandConfig.maxFileSize)}\`` })}.`)
                ]});

                //Crea un nuevo archivo local
                const file = client.fs.createWriteStream(`./storage/audios/${fileName}`);

                //Redirige el contenido del fichero remoto al nuevo fichero local
                response.pipe(file);

                //Cuando el volcado finalice
                file.on('finish', async () => {

                    //Cierra el archivo
                    file.close();

                    //Actualiza la lista de audios
                    this.config.soundList.push(audioName);

                    //Almacena el propietario del fichero de audio
                    const fileOwnerOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.upload.options.owner.name);
                    let fileOwner = fileOwnerOption ? fileOwnerOption.value : interaction.member.id;

                    //Sube el audio a la base de datos
                    client.db.audios[audioName] = {
                        format: fileName.split('.').pop(),
                        ownerId: fileOwner
                    };

                    //Sobreescribe el fichero de la base de datos con los cambios
                    client.fs.writeFile('./storage/databases/audios.json', JSON.stringify(client.db.audios, null, 4), async err => {

                        //Si hubo un error, lo lanza a la consola
                        if (err) throw err;

                        //Almacena el miembro propietario del audio
                        const ownerMember = await client.functions.utilities.fetch.run(client, 'member', fileOwner);

                        //Envía un registro al canal de registro
                        if (client.config.logging.soundUploaded) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                            .setColor(client.config.colors.logging)
                            .setTitle(`📑 ${locale.uploadLoggingEmbed.title}`)
                            .setDescription(locale.uploadLoggingEmbed.description)
                            .addFields(
                                { name: locale.uploadLoggingEmbed.uploader, value: interaction.user.tag, inline: true },
                                { name: locale.uploadLoggingEmbed.owner, value: ownerMember.user.tag, inline: true },
                                { name: locale.uploadLoggingEmbed.audioName, value: `\`${audioName}\``, inline: true }
                            )
                        );

                        //Responde a la interacción con una confirmación
                        await interaction.editReply({ embeds: [ new client.MessageEmbed()
                            .setColor(client.config.colors.correct)
                            .setDescription(`${client.customEmojis.greenTick} ${await client.functions.utilities.parseLocale.run(locale.uploaded, { audioName: `\`${audioName}\`` })}.`)
                        ]});
                    });
                });
            });

        //Si se desea eliminar un audio existente
        } else if (interaction.options._subcommand === locale.appData.options.remove.name) {

            //Almacena la selección del usuario
            const audioName = interaction.options._hoistedOptions[0].value;

            //Almacena si el miembro puede eliminar cualquier audio, en función de si tiene permisos o no
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canRemoveAny.push(client.db.audios[audioName].ownerId)});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantDeleteAny}.`)
            ], ephemeral: true});

            //Almacena el formato del audio elegido
            const fileFormat = client.db.audios[audioName].format;

            //Borra el fichero del audio
            await client.fs.unlink(`./storage/audios/${audioName}.${fileFormat}`, (error) => {

                //Si hubo un error, lo devuelve
                if (error) throw error;
            });

            //Almacena el miembro propietario del audio
            const ownerMember = await client.functions.utilities.fetch.run(client, 'member', client.db.audios[audioName].ownerId);

            //Elimina la entrada de la lista
            this.config.soundList.splice(this.config.soundList.indexOf(audioName), 1);

            //Elimina el audio de la base de datos
            delete client.db.audios[audioName];

            //Sobreescribe el fichero de la base de datos con los cambios
            client.fs.writeFile('./storage/databases/audios.json', JSON.stringify(client.db.audios, null, 4), async err => {

                //Si hubo un error, lo lanza a la consola
                if (err) throw err;

                //Envía un registro al canal de registro
                if (client.config.logging.soundDeleted) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                    .setColor(client.config.colors.logging)
                    .setTitle(`📑 ${locale.deleteLoggingEmbed.title}`)
                    .setDescription(locale.deleteLoggingEmbed.description)
                    .addFields(
                        { name: locale.deleteLoggingEmbed.executor, value: interaction.user.tag, inline: true },
                        { name: locale.deleteLoggingEmbed.owner, value: ownerMember ? ownerMember.user.tag : locale.deleteLoggingEmbed.unknownOwner, inline: true },
                        { name: locale.deleteLoggingEmbed.audioName, value: `\`${audioName}\``, inline: true }
                    )
                );

                //Responde a la interacción con una confirmación
                await interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setDescription(`${client.customEmojis.greenTick} El audio \`${audioName}\` ha sido eliminado correctamente.`)
                ]});
            });
        
        } else { //Si se desea reproducir una grabación

            //Almacena la selección proporcionada por el usuario, o una aleatoria
            const selection = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : soundList[Math.floor(Math.random() * soundList.length)];

            //Comprueba los requisitos previos para el comando
            if (!await client.functions.reproduction.preChecks.run(client, interaction, ['user-connection',  'forbidden-channel',  'can-speak', 'not-afk',  'can-join',  'full-channel'])) return;

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
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.doesntExist, { recordName: selection })}.`)
            ], ephemeral: true});

            //Almacena el formato del audio elegido
            const fileFormat = client.db.audios[selection].format;

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            await client.functions.reproduction.fetchResource.run(client, interaction, fileFormat, selection);

            //Almacena librerías necesarios para manejar conexiones de voz
            const { getVoiceConnection, joinVoiceChannel } = require('@discordjs/voice');

            //Obtiene la conexión de voz actual
            let connection = await getVoiceConnection(interaction.guild.id);

            //Almacena librerías necesarios para manejar estados de conexiones
            const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');

            //Manda un mensaje de notificación de la carga
            interaction.reply({ content: `⌛ | ${await client.functions.utilities.parseLocale.run(locale.loadingFile, { fileName: selection })}.` });

            //Si ya había conexión y el reproductor estaba a la espera, solo ejecuta el mediaPlayer
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'idle') return await client.functions.reproduction.mediaPlayer.run(client, interaction, connection);

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
            const interactionChannel = await client.functions.utilities.fetch.run(client, 'channel', interaction.channelId);

            //Manda un mensaje de confirmación
            interactionChannel.send({ content: `📥 | ${await client.functions.utilities.parseLocale.run(locale.bounded, { voiceChannel: voiceChannel, textChannel: interactionChannel })}.` });

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
            await client.functions.reproduction.mediaPlayer.run(client, interaction, connection);
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
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
        filtered = await client.functions.utilities.getMultipleRandom.run(filtered, 25);

        //Responde a la interacción con la lista
        await interaction.respond(filtered.map(audio => ({ name: audio, value: audio })));

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

//Exporta la configuración del comando
module.exports.config = {
    type: 'global',
    defaultPermission: true,
    dmPermission: false,
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
                    },
                    {
                        optionName: 'owner',
                        type: 'USER',
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
