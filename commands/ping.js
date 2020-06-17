exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!ping
    
    try {
        //TIEMPO DE RESPUESTA DEL BOT
        let botPing = new Date().getTime() - message.createdTimestamp;
        let botPingEmbed;

        if (botPing <= 180) {
            botPingEmbed = new discord.MessageEmbed ()
              .setTitle('Tiempo de respuesta del bot: ')
              .setColor(0x7ED321)
              .setDescription(':stopwatch: | ' + botPing + ' ms');
        } else if (botPing > 180 && botPing <= 250) {
            botPingEmbed = new discord.MessageEmbed ()
              .setTitle('Tiempo de respuesta del bot: ')
              .setColor(0xF5A623)
              .setDescription(':stopwatch: | ' + botPing + ' ms');
        } else {
            botPingEmbed = new discord.MessageEmbed ()
              .setTitle('Tiempo de respuesta del bot: ')
              .setColor(0xF12F49)
              .setDescription(':stopwatch: | ' + botPing + ' ms');
        }

        //TIEMPO DE RESPUESTA DEL WEBSOCKET
        let websocketPing = Math.floor(bot.ping);
        let websocketPingEmbed;

        if (websocketPing <= 180) {
            websocketPingEmbed = new discord.MessageEmbed ()
              .setTitle('Tiempo de respuesta del Websocket: ')
              .setColor(0x7ED321)
              .setDescription(':stopwatch: | ' + websocketPing + ' ms');
        } else if (websocketPing > 180 && websocketPing <= 250) {
            websocketPingEmbed = new discord.MessageEmbed ()
              .setTitle('Tiempo de respuesta del Websocket: ')
              .setColor(0xF5A623)
              .setDescription(':stopwatch: | ' + websocketPing + ' ms');
        } else {
            websocketPingEmbed = new discord.MessageEmbed ()
              .setTitle('Tiempo de respuesta del Websocket: ')
              .setColor(0xF12F49)
              .setDescription(':stopwatch: | ' + websocketPing + ' ms');
        }

        //TIEMPO DE ACTIVIDAD
        let uptimeEmbed;

        async function convertMS( milliseconds ) {
            var day, hour, minute, seconds;
            seconds = Math.floor(milliseconds / 1000);
            minute = Math.floor(seconds / 60);
            seconds = seconds % 60;
            hour = Math.floor(minute / 60);
            minute = minute % 60;
            day = Math.floor(hour / 24);
            hour = hour % 24;

            uptimeEmbed = new discord.MessageEmbed ()
                .setColor(0xFFC857)
                .setTitle('Tiempo de actividad: ')
                .setDescription(':stopwatch: | ' + day + ' días, ' + hour + ' horas, ' + minute + ' minutos y ' + seconds + ' segundos');
        }
        convertMS(bot.uptime);

        //ENVIO DE EMBEDS
        await message.channel.send(botPingEmbed);
        await message.channel.send(websocketPingEmbed);
        await message.channel.send(uptimeEmbed);
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
