exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {

    const noPrivilegesEmbed = new discord.RichEmbed()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(config.botStaff) && !message.member.roles.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)

    //!playskip (URL de YouTube | término)

    try {
        const ytdl = require(`ytdl-core`);
        const moment = require(`moment`);
        
        let noConnectionEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} <@${bot.user.id}> no está conectado a ninguna sala.`);
        
        let noChannelEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${bot.user.id}>.`);

        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es:` + '`' + config.prefix + 'playskip (URL de YouTube | término)`');
        
        let noDispatcherEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay nada en reproducción.`);

        let noTalkPermissionEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.voiceConnection) return message.channel.send(noConnectionEmbed);

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voiceChannelID !== message.guild.member(bot.user).voiceChannelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si se han proporcionado argumentos
        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Comprueba si hay reproducción
        if (!bot.voiceDispatcher) return message.channel.send(noDispatcherEmbed);

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed)

        //Datos de la canción a reproducir
        let info;
        let details;

        //Función para almacenar la información
        async function reproduction(query) {

            //Busca la información
            try {
                info = await ytdl.getInfo(query);
                details = info.player_response.videoDetails;
            } catch (e) {
                let notFoundEmbed = new discord.RichEmbed()
                    .setColor(resources.red)
                    .setDescription(`${resources.RedTick} No se ha podido localizar el vídeo.`);
                return message.channel.send(notFoundEmbed)
            }

            //Genera la información de la cola
            let newQueueItem = {
                link: info.video_url,
                title: details.title,
                duration: moment().startOf('day').seconds(details.lengthSeconds).format('H:mm:ss'),
                requestedBy: message.member.displayName
            };

            //Sube la canción a la cola en el primer puesto
            await bot.servers[message.guild.id].queue.splice(0, 0, newQueueItem);
            
            //Omite la reproducción y manda un mensaje de confirmación
            await message.channel.send(`⏭ | Canción omitida`)
            await bot.voiceDispatcher.end();
        }

        //Si se proporciona una URL de YouTube, busca con esa url, de lo contrario buscará la URL mediante tubesearch
        if (args[0].startsWith(`https://www.youtube/watch?v=`)) {
            //Almacena los datos de la canción
            reproduction(args[0]);
        } else {
            const search = require(`tubesearch`);

            //Manda el mensaje "buscando ..."
            message.channel.send('🔎 | Buscando `' + args.join(` `) + '` ...')

            //Realiza la búsqueda
            await search(args.join(` `)).then((results) => {

                //Almacena el primer resultado que coincida
                const data = results[0];

                let noResultsEmbed = new discord.RichEmbed()
                    .setColor(resources.red)
                    .setDescription(`${resources.RedTick} No se ha encontrado ningún resultado que encaje con ${args.join(' ')}.`);

                //Comprueba si se han obtenido resultados
                if (!data) return message.channel.send(noResultsEmbed);

                //Almacena los datos de la canción
                reproduction(data.link);
            });
        };
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
