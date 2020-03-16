exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!dj
    
    try {
        let noPrivilegesEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle(resources.RedTick + ' Ocurrió un error')
            .setDescription(message.author.username + ', no dispones de privilegios suficientes para ejecutar este comando.\nSolo aquellos que hayan alcanzado el rango **EXPERTOS** pueden usar esta característica.');
    
        if(!message.member.roles.find(r=> r.name === `DJ`)) return message.channel.send(noPrivilegesEmbed);

        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setDescription(resources.GreenTick + ' ¡Te he enviado las instrucciones por Mensaje Directo!');

        let helpEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle('Reproducción de música para Expertos o DJs :musical_note:')
            .setDescription('**Estos comandos sólo pueden ser utilizados en el canal de texto <#388699973866225676>**\n\n• `>play` _Reproduce una canción._\n• `>disconnect` _Desconecta al bot de la sala actual._\n• `>np` _Muestra que se está reproduciendo._\n• `>ping` _Comprueba el tiempo de respuesta._\n• `>skip` _Omite la canción actual._\n• `>seek` _Busca un momento exacto de la canción._\n• `>soundcloud` _Busca una canción en SoundCloud._\n• `>remove` _Elimina una cacnción de la cola._\n• `>loopqueue` _Pone en bucle la cola actual._\n• `>search` _Busca una canciób._\n• `>loop` _Pone en bucle la canción actual._\n• `>join` _Conecta al bot a la sala actual._\n• `>lyrics` _Muestra la letra de la canción actual._\n• `>resume` Quita la pausa de la cola ._\n• `>move` _Mueve una canción a otra posición._\n• `>forward` _Adelanta la canción._\n• `>skipto` _Salta a una posición de la cola._\n• `>clear` _Vacia la cola._\n• `>replay` _Vuelve a reproducir la canción actual._\n• `>pause` _Pausa la cola._\n• `>removedupes` _Borra los duplicados._\n• `>rewind` _Rebobina la canción._\n• `>playskip` _Reproducie una canción ignorando la cola._\n• `>shuffle` _Hace shuffle a la cola._\n• `>queue` _Muestra la cola de reproducción._')
            .setFooter("© 2018 República Gamer LLC", resources.server.iconURL);

        await message.channel.send(successEmbed);
        await message.author.send(helpEmbed);
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
