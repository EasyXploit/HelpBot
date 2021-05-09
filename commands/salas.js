exports.run = (discord, fs, client, message, args, command) => {
    
    //!salas
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(client.colors.gold)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle(`Creación de salas ⚡`)
            .setDescription('Entra en `⚡ | Crear sala` para crear ¡tu propia sala temporal!\n(recuerda que desparecerá si no hay nadie en ella).\n\n**Comandos:**\n• `.voice lock`: _Bloquea el canal para que nadie pueda unirse_\n• `.voice unlock`: _Desbloquea el canal_\n• `.voice name <nombre>`: _Cambiar nombre de canales_\n• `.voice limit <número>`: _Limita cuántos miembros pueden unirse a tu canal_\n• `.voice permit <@usuario>`: _Permitir que cierto miembro se una a tu canal_\n• `.voice reject <@usuario>`: _Rechazar que cierto usuario se una a tu canal_\n• `.voice claim`: _Reclama un canal una vez que el propietario lo haya dejado_\n• `.voice info <id>`: _Obtener información sobre un canal_');
        message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
};
