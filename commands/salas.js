exports.run = (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!salas
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle(`Creación de salas ⚡`)
            .setDescription('Entra en `⚡ | Crear sala` para crear ¡tu propia sala temporal!\n(recuerda que desparecerá si no hay nadie en ella).\n\n**Comandos:**\n• `.voice lock`: _Bloquea el canal para que nadie pueda unirse_\n• `.voice unlock`: _Desbloquea el canal_\n• `.voice name <nombre>`: _Cambiar nombre de canales_\n• `.voice limit <número>`: _Limita cuántos usuarios pueden unirse a tu canal_\n• `.voice permit <@usuario>`: _Permitir que cierto usuario se una a tu canal_\n• `.voice reject <@usuario>`: _Rechazar que cierto usuario se una a tu canal_\n• `.voice claim`: _Reclama un canal una vez que el propietario lo haya dejado_\n• `.voice info <id>`: _Obtener información sobre un canal_')
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());
        message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
};
