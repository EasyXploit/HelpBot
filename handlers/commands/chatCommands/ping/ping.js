export async function run(interaction, commandConfig, locale) {
    
    try {

        //Mide el tiempo de respuesta del bot
        const botPing = new Date().getTime() - interaction.createdTimestamp;

        //Genera un embed para el tiempo de respuesta
        let botPingEmbed = new discord.EmbedBuilder()
            .setTitle(`${locale.botResponseTime}: `)
            .setDescription(`:stopwatch: | ${botPing} ms`);

        //Asigna un color al embed en función del valor del ping
        if (botPing <= 180) botPingEmbed.setColor('7ED321');
        else if (botPing > 180 && botPing <= 250) botPingEmbed.setColor('F5A623');
        else botPingEmbed.setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`);

        //Mide el tiempo de respuesta del websocket
        const websocketPing = Math.floor(client.ws.ping);

        //Genera un embed para el tiempo de respuesta
        let websocketPingEmbed = new discord.EmbedBuilder()
            .setTitle(`${locale.websocketResponseTime}: `)
            .setDescription(`:stopwatch: | ${websocketPing} ms`);

        //Asigna un color al embed en función del valor del ping
        if (websocketPing <= 180) websocketPingEmbed.setColor('7ED321');
        else if (websocketPing > 180 && websocketPing <= 250) websocketPingEmbed.setColor('F5A623');
        else websocketPingEmbed.setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`);

        //Envía los embeds generados
        await interaction.reply({ embeds: [ botPingEmbed, websocketPingEmbed] });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: []
    },
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput
    }
};
