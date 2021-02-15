exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!musica
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setAuthor('Reproducción de música', 'https://i.imgur.com/SidVFnv.png')
            .setDescription(`Estos comandos te permiten reproducir canciones desde YouTube en los canales de voz permitidos mediante ${client.user.username} ${resources.beta}`)
            .addField(`⏯ ${config.prefix}play (URL de YouTube | término | nada)`, `Busca una canción o playlist en YouTube para reproducirla a continuación, o añadirla a la cola.`, true)
            .addField(`⏭ ${config.prefix}playskip (URL de YouTube | término) ${resources.dj}`, `Reproduce la canción o playlist inmediatamente (a pesar de la cola)`, true)
            .addField(`➡ ${config.prefix}skip (cantidad opcional | all) ${resources.dj}`, `Omite la canción actual (o más si se especifica cantidad)`, true)
            .addField(`❎ ${config.prefix}remove (posición | all) ${resources.dj}`, `Elimina una canción de la cola de reproducción`, true)
            .addField(`↩ ${config.prefix}replay ${resources.dj}`, `Vuelve a reproducir la canción actual desde el principio`, true)
            .addField(`↪ ${config.prefix}move (posición 1) (posición 2) ${resources.dj}`, `Cambia la ubicación de una canción en la cola`, true)
            .addField(`▶ ${config.prefix}resume ${resources.dj}`, `Reanuda la reproducción (si está pausada)`, true)
            .addField(`⏸ ${config.prefix}pause ${resources.dj}`, `Pausa la reproducción`, true)
            .addField(`⏺ ${config.prefix}join`, `Hace que el bot se una a tu canal de voz`, true)
            .addField(`⏏ ${config.prefix}leave ${resources.dj}`, `Hace que el bot abandone el canal de voz actual`, true)
            .addField(`📑 ${config.prefix}queue (página | nada)`, `Muestra la cola de reproducción actual`, true)
            .addField(`➿ ${config.prefix}np`, `Muestra el estado de la canción actual`, true)
            .addField(`❌ ${config.prefix}clear ${resources.dj}`, `Elimina toda la cola de reproducción`, true)
            .addField(`🔀 ${config.prefix}shuffle ${resources.dj}`, `Activa el modo aleatorio en la cola`, true)
            .addField(`🔂 ${config.prefix}loop ${resources.dj}`, `Activa el modo bucle en la canción`, true)
            .addField(`🔁 ${config.prefix}loopqueue ${resources.dj}`, `Activa el modo bucle en la cola\n\n_Si un comando tiene la etiqueta ${resources.dj}, quiere decir que se requerirá una votación en el caso de que no estés solo en la sala. Los DJ pueden omitir esta votación._\n\n• Usa el prefijo \`>\` para controlar a ${resources.rythm} <@235088799074484224>`, true);
    
        
        await message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
