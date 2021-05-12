exports.run = async (discord, client, message, args, command, supervisorsRole, noPrivilegesEmbed) => {
    
    //-infractions (@miembro | id)

    try {
        let noUserEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} No has proporcionado un miembro válido`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} No puedes obtener información de un bot`);

        const member = await client.functions.fetchMember(message.guild, args[0] || message.author.id);
        if (!member) return message.channel.send(noUserEmbed);

        let user = member.user;
        if (user.bot) return message.channel.send(noBotsEmbed);

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

            Object.keys(client.warns[member.id]).forEach(entry => {
                if (Date.now() - entry <= '86400000') infractionsCount.day++
                if (Date.now() - entry <= '604800000') infractionsCount.week++
            });

            let userWarns = Object.entries(client.warns[member.id]).map((e) => ( { [e[0]]: e[1] } ));

            for (let i = 0; i < 10; i++) {
                if (!userWarns[i]) continue;

                Object.keys(userWarns[i]).forEach((key) => {
                    let moderator = message.guild.members.cache.get(userWarns[i][key].moderator);
                    if (typeof moderator === "undefined") moderator = 'Moderador desconocido';
                    lastWarns = lastWarns + `\`${key}\` • ${moderator} • ${new Date(parseInt(key)).toLocaleString()}\n${userWarns[i][key].reason}\n\n`;
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
            .setColor(client.colors.gold)
            .setTitle(`⚠ Infracciones`)
            .setDescription(`Mostrando las advertencias del miembro **${member.user.tag}**\nSanción actual: \`${sanction || 'Ninguna'}\``)
            .setThumbnail(user.displayAvatarURL())
            .addField(`Últimas 24h`, infractionsCount.day, true)
            .addField(`Últimos 7 días`, infractionsCount.week, true)
            .addField(`Total`, infractionsCount.total, true)
            .addField(`Últimas 10 advertencias`, lastWarns || 'Ninguna');
        
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    };
};
