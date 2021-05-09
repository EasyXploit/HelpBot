exports.run = async (event, discord, fs, client) => {
    
    try {
        //Comprobación de servidor joineado
        if (!client.homeGuild || event.id === client.homeGuild) {

            //Graba la nueva guild en la configuración
            client.config.guild.homeGuild = event.id;
            await fs.writeFile('./configs/guild.json', JSON.stringify(config, null, 4), (err) => console.error);

            const botAddedEmbed = new discord.MessageEmbed()
                .setColor(client.colors.blue2)
                .setDescription(`${event.owner}, **${client.user.username}** ha sido añadido a tu servidor (${event.name}).`)

            await event.owner.send(botAddedEmbed);
        } else {
            const cantJoinEmbed = new discord.MessageEmbed()
                .setColor(client.colors.gray)
                .setDescription(`${client.emotes.grayTick} | ${client.user.username} no está diseñado para funcionar en más de una guild.`);

            await event.owner.send(cantJoinEmbed)
            await event.leave();
        };
    } catch (e) {

        let error = e.stack;
        if (error.length > 1014) error = error.slice(0, 1014);
        error = error + ' ...';

        //Se muestra el error en el canal de depuración
        const debuggEmbed = new discord.MessageEmbed()
            .setColor(client.colors.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `guildCreate`, true)
            .addField(`Fecha:`, new Date().toLocaleString(), true)
            .addField(`Error:`, `\`\`\`${error}\`\`\``);
        
        //Se envía el mensaje al canal de depuración
        await client.debuggingChannel.send(debuggEmbed);
    };
};
