exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {

        //Mide el tiempo de respuesta del bot
        const botPing = new Date().getTime() - message.createdTimestamp;

        //Genera un embed para el tiempo de respuesta
        let botPingEmbed = new client.MessageEmbed()
            .setTitle('Tiempo de respuesta del bot: ')
            .setDescription(`:stopwatch: | ${botPing} ms`);

        //Asigna un color al embed en función del valor del ping
        if (botPing <= 180) botPingEmbed.setColor('7ED321');
        else if (botPing > 180 && botPing <= 250) botPingEmbed.setColor('F5A623');
        else botPingEmbed.setColor(client.config.colors.secondaryError);

        //Mide el tiempo de respuesta del websocket
        const websocketPing = Math.floor(client.ws.ping);

        //Genera un embed para el tiempo de respuesta
        let websocketPingEmbed = new client.MessageEmbed()
            .setTitle('Tiempo de respuesta del Websocket: ')
            .setDescription(`:stopwatch: | ${websocketPing} ms`);

        //Asigna un color al embed en función del valor del ping
        if (websocketPing <= 180) websocketPingEmbed.setColor('7ED321');
        else if (websocketPing > 180 && websocketPing <= 250) websocketPingEmbed.setColor('F5A623');
        else websocketPingEmbed.setColor(client.config.colors.secondaryError);

        //Envía los embeds generados
        await message.channel.send({ embeds: [ botPingEmbed, websocketPingEmbed] });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'ping',
    aliases: ['status']
};
