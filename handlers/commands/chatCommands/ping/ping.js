exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Mide el tiempo de respuesta del bot
        const botPing = new Date().getTime() - interaction.createdTimestamp;

        //Genera un embed para el tiempo de respuesta
        let botPingEmbed = new client.MessageEmbed()
            .setTitle(`${locale.botResponseTime}: `)
            .setDescription(`:stopwatch: | ${botPing} ms`);

        //Asigna un color al embed en función del valor del ping
        if (botPing <= 180) botPingEmbed.setColor('7ED321');
        else if (botPing > 180 && botPing <= 250) botPingEmbed.setColor('F5A623');
        else botPingEmbed.setColor(client.config.colors.secondaryError);

        //Mide el tiempo de respuesta del websocket
        const websocketPing = Math.floor(client.ws.ping);

        //Genera un embed para el tiempo de respuesta
        let websocketPingEmbed = new client.MessageEmbed()
            .setTitle(`${locale.websocketResponseTime}: `)
            .setDescription(`:stopwatch: | ${websocketPing} ms`);

        //Asigna un color al embed en función del valor del ping
        if (websocketPing <= 180) websocketPingEmbed.setColor('7ED321');
        else if (websocketPing > 180 && websocketPing <= 250) websocketPingEmbed.setColor('F5A623');
        else websocketPingEmbed.setColor(client.config.colors.secondaryError);

        //Envía los embeds generados
        await interaction.reply({ embeds: [ botPingEmbed, websocketPingEmbed] });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: true,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT'
    }
};
