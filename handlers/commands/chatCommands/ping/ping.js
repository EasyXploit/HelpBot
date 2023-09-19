export async function run(interaction, commandConfig, locale) {
    
    try {

        // Measures the response time of the bot
        const botPing = new Date().getTime() - interaction.createdTimestamp;

        // Generates an embed for response time
        let botPingEmbed = new discord.EmbedBuilder()
            .setTitle(`${locale.botResponseTime}: `)
            .setDescription(`:stopwatch: | ${botPing} ms`);

        // Assigns an embed color depending on the value of the ping
        if (botPing <= 180) botPingEmbed.setColor('7ED321');
        else if (botPing > 180 && botPing <= 250) botPingEmbed.setColor('F5A623');
        else botPingEmbed.setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`);

        // Measures the Websockt response time
        const websocketPing = Math.floor(client.ws.ping);

        // Generates an embed for the response time
        let websocketPingEmbed = new discord.EmbedBuilder()
            .setTitle(`${locale.websocketResponseTime}: `)
            .setDescription(`:stopwatch: | ${websocketPing} ms`);

        // Assigns an embed color depending on the value of the ping
        if (websocketPing <= 180) websocketPingEmbed.setColor('7ED321');
        else if (websocketPing > 180 && websocketPing <= 250) websocketPingEmbed.setColor('F5A623');
        else websocketPingEmbed.setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`);

        // Sends the generated embeds
        await interaction.reply({ embeds: [ botPingEmbed, websocketPingEmbed] });
        
    } catch (error) {

        // Executes the error handler
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
