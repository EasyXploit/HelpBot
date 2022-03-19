exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        //TIEMPO DE RESPUESTA DEL BOT
        let botPing = new Date().getTime() - message.createdTimestamp;
        let botPingEmbed = new client.MessageEmbed()
            .setTitle('Tiempo de respuesta del bot: ')
            .setDescription(`:stopwatch: | ${botPing} ms`);

        if (botPing <= 180) {
            botPingEmbed.setColor('7ED321');
        } else if (botPing > 180 && botPing <= 250) {
            botPingEmbed.setColor('F5A623');
        } else {
            botPingEmbed.setColor(client.config.colors.secondaryError);
        }

        //TIEMPO DE RESPUESTA DEL WEBSOCKET
        let websocketPing = Math.floor(client.ws.ping);
        let websocketPingEmbed = new client.MessageEmbed()
            .setTitle('Tiempo de respuesta del Websocket: ')
            .setDescription(`:stopwatch: | ${websocketPing} ms`);

        if (websocketPing <= 180) {
            websocketPingEmbed.setColor('7ED321');
        } else if (websocketPing > 180 && websocketPing <= 250) {
            websocketPingEmbed.setColor('F5A623');
        } else {
            websocketPingEmbed.setColor(client.config.colors.secondaryError);
        }

        //ENVIO DE EMBEDS
        await message.channel.send({ embeds: [ botPingEmbed, websocketPingEmbed] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'ping',
    description: 'Proporciona información sobre el estado del bot.',
    aliases: ['status'],
    parameters: ''
};
