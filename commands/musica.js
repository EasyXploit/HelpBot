exports.run = async (discord, client, message, args, command) => {
    
    //!musica
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(client.colors.primary)
            .setAuthor('Reproducción de música', 'https://i.imgur.com/SidVFnv.png')
            .setDescription(`Estos comandos te permiten reproducir canciones desde YouTube en los canales de voz permitidos mediante ${client.user.username}`)
            .addField(`⏯ ${client.config.prefixes.mainPrefix}play (URL de YouTube | término | nada)`, 'Busca una canción o playlist en YouTube para reproducirla a continuación, o añadirla a la cola.', true)
            .addField(`⏭ ${client.config.prefixes.mainPrefix}playskip (URL de YouTube | término) *`, 'Reproduce la canción o playlist inmediatamente (a pesar de la cola)', true)
            .addField(`➡ ${client.config.prefixes.mainPrefix}skip (cantidad opcional | all) *`, 'Omite la canción actual (o más si se especifica cantidad)', true)
            .addField(`❎ ${client.config.prefixes.mainPrefix}remove (posición | all) *`, 'Elimina una canción de la cola de reproducción', true)
            .addField(`↩ ${client.config.prefixes.mainPrefix}replay *`, 'Vuelve a reproducir la canción actual desde el principio', true)
            .addField(`↪ ${client.config.prefixes.mainPrefix}move (posición 1) (posición 2) *`, 'Cambia la ubicación de una canción en la cola', true)
            .addField(`▶ ${client.config.prefixes.mainPrefix}resume *`, 'Reanuda la reproducción (si está pausada)', true)
            .addField(`⏸ ${client.config.prefixes.mainPrefix}pause *`, 'Pausa la reproducción', true)
            .addField(`⏺ ${client.config.prefixes.mainPrefix}join`, 'Hace que el bot se una a tu canal de voz', true)
            .addField(`⏏ ${client.config.prefixes.mainPrefix}leave *`, 'Hace que el bot abandone el canal de voz actual', true)
            .addField(`📑 ${client.config.prefixes.mainPrefix}queue (página | nada)`, 'Muestra la cola de reproducción actual', true)
            .addField(`➿ ${client.config.prefixes.mainPrefix}np`, 'Muestra el estado de la canción actual', true)
            .addField(`❌ ${client.config.prefixes.mainPrefix}clear *`, 'Elimina toda la cola de reproducción', true)
            .addField(`🔀 ${client.config.prefixes.mainPrefix}shuffle *`, 'Activa el modo aleatorio en la cola', true)
            .addField(`🔂 ${client.config.prefixes.mainPrefix}loop *`, 'Activa el modo bucle en la canción', true)
            .addField(`🔁 ${client.config.prefixes.mainPrefix}loopqueue *`, `Activa el modo bucle en la cola\n\n_Si un comando tiene la etiqueta (*), quiere decir que se requerirá una votación en el caso de que no estés solo en la sala. Los DJ pueden omitir esta votación._\n\n• Usa el prefijo \`>\` para controlar a ${client.emotes.rythm} <@235088799074484224>`, true);
        
        await message.channel.send(helpEmbed);
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    } catch (error) {
    };
};
