exports.run = async (discord, fs, client, message, args, command) => {
    
    //!musica
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(client.colors.gold)
            .setAuthor('Reproducción de música', 'https://i.imgur.com/SidVFnv.png')
            .setDescription(`Estos comandos te permiten reproducir canciones desde YouTube en los canales de voz permitidos mediante ${client.user.username} ${client.emotes.beta}`)
            .addField(`⏯ ${client.config.prefixes.mainPrefix}play (URL de YouTube | término | nada)`, `Busca una canción o playlist en YouTube para reproducirla a continuación, o añadirla a la cola.`, true)
            .addField(`⏭ ${client.config.prefixes.mainPrefix}playskip (URL de YouTube | término) ${client.emotes.dj}`, `Reproduce la canción o playlist inmediatamente (a pesar de la cola)`, true)
            .addField(`➡ ${client.config.prefixes.mainPrefix}skip (cantidad opcional | all) ${client.emotes.dj}`, `Omite la canción actual (o más si se especifica cantidad)`, true)
            .addField(`❎ ${client.config.prefixes.mainPrefix}remove (posición | all) ${client.emotes.dj}`, `Elimina una canción de la cola de reproducción`, true)
            .addField(`↩ ${client.config.prefixes.mainPrefix}replay ${client.emotes.dj}`, `Vuelve a reproducir la canción actual desde el principio`, true)
            .addField(`↪ ${client.config.prefixes.mainPrefix}move (posición 1) (posición 2) ${client.emotes.dj}`, `Cambia la ubicación de una canción en la cola`, true)
            .addField(`▶ ${client.config.prefixes.mainPrefix}resume ${client.emotes.dj}`, `Reanuda la reproducción (si está pausada)`, true)
            .addField(`⏸ ${client.config.prefixes.mainPrefix}pause ${client.emotes.dj}`, `Pausa la reproducción`, true)
            .addField(`⏺ ${client.config.prefixes.mainPrefix}join`, `Hace que el bot se una a tu canal de voz`, true)
            .addField(`⏏ ${client.config.prefixes.mainPrefix}leave ${client.emotes.dj}`, `Hace que el bot abandone el canal de voz actual`, true)
            .addField(`📑 ${client.config.prefixes.mainPrefix}queue (página | nada)`, `Muestra la cola de reproducción actual`, true)
            .addField(`➿ ${client.config.prefixes.mainPrefix}np`, `Muestra el estado de la canción actual`, true)
            .addField(`❌ ${client.config.prefixes.mainPrefix}clear ${client.emotes.dj}`, `Elimina toda la cola de reproducción`, true)
            .addField(`🔀 ${client.config.prefixes.mainPrefix}shuffle ${client.emotes.dj}`, `Activa el modo aleatorio en la cola`, true)
            .addField(`🔂 ${client.config.prefixes.mainPrefix}loop ${client.emotes.dj}`, `Activa el modo bucle en la canción`, true)
            .addField(`🔁 ${client.config.prefixes.mainPrefix}loopqueue ${client.emotes.dj}`, `Activa el modo bucle en la cola\n\n_Si un comando tiene la etiqueta ${client.emotes.dj}, quiere decir que se requerirá una votación en el caso de que no estés solo en la sala. Los DJ pueden omitir esta votación._\n\n• Usa el prefijo \`>\` para controlar a ${client.emotes.rythm} <@235088799074484224>`, true);
    
        
        await message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
