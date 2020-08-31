exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!boxbot
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(0xFFC857)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle(`BoxBot, el minijuego ${resources.boxbot}`)
            .setDescription('**Recuerda que estos comandos sólo pueden ser utilizados en los canales de texto <#433376010688397312> y <#435495241840328705>**\n\n• `b!buy [objeto]` _permite comprar un objeto._\n• `b!claim` _te otorga una recompensa por votar por @BoxBot._\n• `b!cooldowns` _muestra los tiempos de espera._\n• `b!daily` _te otorga una recompensa diaria._\n• `b!grank` _muestra tu rango en el top global._\n• `b!gtop` _muestra el top global de servidores._\n• `b!health [objeto]` _usar un objeto para recuperar salud._\n• `b!image [objeto]` _muestra un objeto._\n• `b!inventory [@usuario]` _muestra el inventario (tuyo o de alguien)._\n• `b!items` _muestra una lista con todos los objetos._\n• `b!killfeed` _muestra el feed de muertes._\n• `b!level [@usuario]` _muestra tu nivel o el de otro usuario._\n• `b!money [@usuario]` _muestra tu dinero o el de otro usuario._\n• `b!notify` _activa las notivifaciones via MD._\n• `b!optin` _te permite jugar en un servidor._\n• `b!optout` _te excluye de jugar en un servidor._\n• `b!profile [@usuario]` _muestra el perfil de un usuario._\n• `b!rank [@usuario]` _muestra el rango de un usuario._\n• `b!sell [objeto]` _vende un objeto de tu inventario._\n• `b!sellall` _vende todo tu inventario._\n• `b!top` _muestra el top del servidor._\n• `b!trade [@usuario]` _permite intecambiar con otro usuario._\n• `b!trivia` _inicia un trivia con recompensa._\n• `b!unbox` _abre una caja nueva al azar._\n• `b!use [objeto]` _sirve para utilizar un objeto._\n• `b!value [@usuario]` _muestra el valor de un inventario._\n• `b!weekly` _te otorga una recompensa semanal._')
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());
        message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
