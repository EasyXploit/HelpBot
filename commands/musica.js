exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!musica
    
    try {
        let helpEmbed1 = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setAuthor('Reproducción de música', 'https://i.imgur.com/SidVFnv.png')
            .setDescription(`Estos comandos te permiten reproducir canciones mediante ${client.user.username} ${resources.beta}`)
            .addField(`⏯ ${config.prefix}play (URL de YouTube | término | nada)`, `Busca una canción en YouTube para reproducirla a continuación, o añadirla a la cola.`, true)
            .addField(`⏭ ${config.prefix}playskip (URL de YouTube | término)`, `Reproduce la canción inmediatamente (a pesar de la cola)`, true)
            .addField(`➡ ${config.prefix}skip (cantidad opcional)`, `Omite la canción actual (o más si se especifica cantidad)`, true)
            .addField(`❎ ${config.prefix}remove (posición)`, `Elimina una canción de la cola de reproducción`, true)
            .addField(`↩ ${config.prefix}replay`, `Vuelve a reproducir la canción actual desde el principio`, true)
            .addField(`↪ ${config.prefix}move (posición 1) (posición 2)`, `Cambia la ubicación de una canción en la cola`, true)
            .addField(`▶ ${config.prefix}resume`, `Reanuda la reproducción (si está pausada)`, true)
            .addField(`⏸ ${config.prefix}pause`, `Pausa la reproducción`, true)
            .addField(`⏺ ${config.prefix}join`, `Hace que el bot se una a tu canal de voz`, true)
            .addField(`⏏ ${config.prefix}leave`, `Hace que el bot abandone el canal de voz actual`, true)
            .addField(`📑 ${config.prefix}queue`, `Muestra la cola de reproducción actual`, true)
            .addField(`➿ ${config.prefix}np`, `Muestra el estado de la canción actual`, true)
            .addField(`❌ ${config.prefix}clear`, `Elimina toda la cola de reproducción`, true)
            .addField(`🔀 ${config.prefix}shuffle`, `Activa el modo aleatorio en la cola`, true)
            .addField(`🔂 ${config.prefix}loop`, `Activa el modo bucle en la canción`, true)
            .addField(`🔁 ${config.prefix}loopqueue`, `Activa el modo bucle en la cola`, true)
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());
        
            let helpEmbed2 = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setAuthor(`Comandos de Rythm`, `https://cdn.discordapp.com/avatars/235088799074484224/16c197c4c3f0eb808f9bceb6e1075e71.png?`)
            .setDescription(`Estos comandos te permiten reproducir canciones mediante ${resources.rythm} **Rythm**.\n• Usa el prefijo \`>\` para controlar a ${resources.rythm} <@235088799074484224>\n\n**Los comandos sólo pueden ser utilizados en el canal de texto <#388699973866225676>**\n\n__**Básicos:**__ :musical_score: \n• \`>play [canción]\`  _reproduce una canción_ \n• \`>skip\`  _omite la canción actual_ \n• \`>pause\`  _pausa la cola_ \n• \`>clear\`  _borra la cola de reproducción_ \n• \`>join\`  _mueve el bot al canal de voz actual_ \n• \`>leave\`  _desconecta el bot del canal de voz actual_ \n• \`>queue\`  _muestra la cola_ \n \n __**Avanzados:**__ :notes: \n• \`>loop\`  _reproduce en bucle la canción actual_ \n• \`>loopqueue\`  _reproduce en bucle toda la cola_ \n• \`>lyrics\`  _muestra la letra de la canción actual_ \n• \`>np\`  _muestra la canción actual_ \n • \`>seek [momento (00:00)]\` _busca un momento exacto de la canción_ \n• \`>shuffle\`  _reproduce aleatoriamente_ \n• \`>soundcloud\`  _busca en SoundCloud_ \n\n• \`>aliases\`  _para ver el resto de comandos_`);
        
        await message.channel.send(helpEmbed1);
        await message.channel.send(helpEmbed2);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
