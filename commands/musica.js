exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!musica
    
    try {
        let helpEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle('Reproducción de música :musical_note:')
            .setDescription('Estos comandos te permiten reproducir canciones en los canales de voz.\nUsa el prefijo `>` para controlar a <@235088799074484224> y el prefijo `?` para controlar a <@252128902418268161>\n\n**Los comandos sólo pueden ser utilizados en el canal de texto <#388699973866225676>**\n\n__**Básicos:**__ :musical_score: \n • `>play [canción]`  _reproduce una canción_ \n • `>skip`  _omite la canción actual_ \n • `>pause`  _pausa la cola_ \n • `>clear`  _borra la cola de reproducción_ \n • `>join`  _mueve el bot al canal de voz actual_ \n • `>leave`  _desconecta el bot del canal de voz actual_ \n • `>queue`  _muestra la cola_ \n \n __**Avanzados:**__ :notes: \n • `>loop`  _reproduce en bucle la canción actual_ \n • `>loopqueue`  _reproduce en bucle toda la cola_ \n • `>lyrics`  _muestra la letra de la canción actual_ \n • `>np`  _muestra la canción actual_ \n • `>seek [momento (00:00)]` _busca un momento exacto de la canción_ \n • `>shuffle`  _reproduce aleatoriamente_ \n • `>soundcloud`  _busca en SoundCloud_ \n \n • `>aliases`  _para ver el resto de comandos_')
            .setFooter("© 2018 República Gamer LLC", message.guild.iconURL);
        message.channel.send(helpEmbed);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
