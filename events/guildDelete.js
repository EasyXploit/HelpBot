exports.run = async (event, client, discord) => {
    
    try {
        //DESCONFIGURAR TODO
    } catch (e) {

        let error = e.stack;
        if (error.length > 1014) error = error.slice(0, 1014);
        error = `${error} ...`;

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.MessageEmbed()
            .setColor(client.colors.brown)
            .setTitle('📋 Depuración')
            .setDescription('Se declaró un error durante la ejecución de un evento')
            .addField('Evento:', 'guildMemberRemove', true)
            .addField('Fecha:', new Date().toLocaleString(), true)
            .addField('Error:', `\`\`\`${error}\`\`\``);
        
        //Se envía el mensaje al canal de depuración
        await client.debuggingChannel.send(debuggEmbed);
    };
};
