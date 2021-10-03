exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!ping
    
    try {
        //TIEMPO DE RESPUESTA DEL BOT
        let botPing = new Date().getTime() - message.createdTimestamp;
        let botPingEmbed;

        if (botPing <= 180) {
            botPingEmbed = new discord.MessageEmbed()
              .setTitle(`Tiempo de respuesta del bot: `)
              .setColor('7ED321')
              .setDescription(`:stopwatch: | ${botPing} ms`);
        } else if (botPing > 180 && botPing <= 250) {
            botPingEmbed = new discord.MessageEmbed()
              .setTitle(`Tiempo de respuesta del bot: `)
              .setColor('F5A623')
              .setDescription(`:stopwatch: | ${botPing} ms`);
        } else {
            botPingEmbed = new discord.MessageEmbed()
              .setTitle(`Tiempo de respuesta del bot: `)
              .setColor(client.config.colors.error2)
              .setDescription(`:stopwatch: | ${botPing} ms`);
        }

        //TIEMPO DE RESPUESTA DEL WEBSOCKET
        let websocketPing = Math.floor(client.ws.ping);
        let websocketPingEmbed;

        if (websocketPing <= 180) {
            websocketPingEmbed = new discord.MessageEmbed()
              .setTitle(`Tiempo de respuesta del Websocket: `)
              .setColor('7ED321')
              .setDescription(`:stopwatch: | ${websocketPing} ms`);
        } else if (websocketPing > 180 && websocketPing <= 250) {
            websocketPingEmbed = new discord.MessageEmbed()
              .setTitle(`Tiempo de respuesta del Websocket: `)
              .setColor('F5A623')
              .setDescription(`:stopwatch: | ${websocketPing} ms`);
        } else {
            websocketPingEmbed = new discord.MessageEmbed()
              .setTitle(`Tiempo de respuesta del Websocket: `)
              .setColor(client.config.colors.error2)
              .setDescription(`:stopwatch: | ${websocketPing} ms`);
        }

        //ENVIO DE EMBEDS
        await message.channel.send(botPingEmbed);
        await message.channel.send(websocketPingEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'ping',
    aliases: ['status']
};
