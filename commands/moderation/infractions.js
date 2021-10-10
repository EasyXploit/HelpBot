exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!infractions (@miembro | id)

    try {
        let noUserEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No puedes obtener información de un bot`);

        const member = await client.functions.fetchMember(message.guild, args[0] || message.author.id);
        if (!member) return message.channel.send({ embeds: [noUserEmbed] });

        let user = member.user;
        if (user.bot) return message.channel.send({ embeds: [noBotsEmbed] });

        //Comprueba el número de warns del miembro
        let warns;
        if (!client.warns[member.id]) {
            warns = 0
        } else {
            warns = client.warns[member.id].length;
        }

        let infractionsCount = {
            day: 0,
            week: 0,
            total: 0
        }

        let lastWarns = '';

        if (client.warns[member.id]) {
            infractionsCount.total = Object.keys(client.warns[member.id]).length;

            Object.values(client.warns[member.id]).forEach(entry => {
                if (Date.now() - entry.timestamp <= '86400000') infractionsCount.day++
                if (Date.now() - entry.timestamp <= '604800000') infractionsCount.week++
            });

            let userWarns = Object.entries(client.warns[member.id]).map((e) => ( { [e[0]]: e[1] } ));

            for (let i = 0; i < 10; i++) {
                if (!userWarns[i]) continue;

                Object.keys(userWarns[i]).forEach((key) => {
                    let moderator = message.guild.members.cache.get(userWarns[i][key].moderator);
                    if (typeof moderator === "undefined") moderator = 'Moderador desconocido';
                    lastWarns = lastWarns + `\`${key}\` • ${moderator} • ${new Date(parseInt(userWarns[i][key].timestamp)).toLocaleString()}\n${userWarns[i][key].reason}\n\n`;
                })
            }

        }

        //Comprueba si existe el rol silenciado, sino lo crea
        let role = await client.functions.checkMutedRole(message.guild);

        let sanction;
        if (client.mutes[member.id]) {
            sanction = `Silenciado hasta ${new Date(client.mutes[member.id].time).toLocaleString()}`;
        } else if (member.roles.cache.has(role.id)) {
            sanction = 'Silenciado indefinidamente';
        }

        let resultEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setTitle(`⚠ Infracciones`)
            .setDescription(`Mostrando las advertencias del miembro **${member.user.tag}**\nSanción actual: \`${sanction || 'Ninguna'}\``)
            .setThumbnail(user.displayAvatarURL({dynamic: true}))
            .addField(`Últimas 24h`, infractionsCount.day, true)
            .addField(`Últimos 7 días`, infractionsCount.week, true)
            .addField(`Total`, infractionsCount.total, true)
            .addField(`Últimas 10 advertencias`, lastWarns || 'Ninguna');
        
        message.channel.send({ embeds: [resultEmbed] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'infractions',
    aliases: ['warns']
};
