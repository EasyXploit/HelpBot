exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!salas
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle(`Creación de salas ⚡`)
            .setDescription('Entra en `⚡ | Crear sala` para crear ¡tu propia sala temporal!\n(recuerda que desparecerá si no hay nadie en ella).\n\n**Comandos:**\n• \`.voice game\`: _Cambiar el nombre de la sala al del juego que estás jugando._\n\• `.voice invite @usuario\`: _Invitar al usuario a la sala con un enlace directo._\n\• `.voice permit/reject @rol\`: _Permitir/bloquear un rol para que no pueda entrar._')
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());
        message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
};
