exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!music
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(client.colors.primary)
            .setAuthor('Reproducción de música', 'https://i.imgur.com/SidVFnv.png')
            .setDescription(`Estos comandos te permiten reproducir canciones desde YouTube en los canales de voz permitidos mediante ${client.user.username}`)
            .addField(`⏯ ${client.config.guild.prefix}play (URL de YouTube | término | nada)`, 'Busca una canción o playlist en YouTube para reproducirla a continuación, o añadirla a la cola.', true)
            .addField(`⏭ ${client.config.guild.prefix}playskip (URL de YouTube | término) *`, 'Reproduce la canción o playlist inmediatamente (a pesar de la cola)', true)
            .addField(`➡ ${client.config.guild.prefix}skip (cantidad opcional | all) *`, 'Omite la canción actual (o más si se especifica cantidad)', true)
            .addField(`❎ ${client.config.guild.prefix}remove (posición | all) *`, 'Elimina una canción de la cola de reproducción', true)
            .addField(`↩ ${client.config.guild.prefix}replay *`, 'Vuelve a reproducir la canción actual desde el principio', true)
            .addField(`↪ ${client.config.guild.prefix}move (posición 1) (posición 2) *`, 'Cambia la ubicación de una canción en la cola', true)
            .addField(`▶ ${client.config.guild.prefix}resume *`, 'Reanuda la reproducción (si está pausada)', true)
            .addField(`⏸ ${client.config.guild.prefix}pause *`, 'Pausa la reproducción', true)
            .addField(`⏺ ${client.config.guild.prefix}join`, 'Hace que el bot se una a tu canal de voz', true)
            .addField(`⏏ ${client.config.guild.prefix}leave *`, 'Hace que el bot abandone el canal de voz actual', true)
            .addField(`📑 ${client.config.guild.prefix}queue (página | nada)`, 'Muestra la cola de reproducción actual', true)
            .addField(`➿ ${client.config.guild.prefix}np`, 'Muestra el estado de la canción actual', true)
            .addField(`❌ ${client.config.guild.prefix}clear *`, 'Elimina toda la cola de reproducción', true)
            .addField(`🔀 ${client.config.guild.prefix}shuffle *`, 'Activa el modo aleatorio en la cola', true)
            .addField(`🔂 ${client.config.guild.prefix}loop *`, 'Activa el modo bucle en la canción', true)
            .addField(`🔁 ${client.config.guild.prefix}loopqueue *`, `Activa el modo bucle en la cola\n\n_Si un comando tiene la etiqueta (*), quiere decir que se requerirá una votación en el caso de que no estés solo en la sala. Los DJ pueden omitir esta votación._\n\n• Usa el prefijo \`>\` para controlar a <@235088799074484224>`, true);
        
        await message.channel.send(helpEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};
