exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-infractions (@miembro | id)

    try {
        let noUserEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} No has proporcionado un usuario válido`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} No puedes obtener información de un bot`);

        const member = await resources.fetchMember(message.guild, args[0] || message.author.id);
        if (!member) return message.channel.send(noUserEmbed);

        let user = member.user;
        if (user.bot) return message.channel.send(noBotsEmbed);

        //Comprueba el número de warns del usuario
        let warns;
        if (!bot.warns[member.id]) {
            warns = 0
        } else {
            warns = bot.warns[member.id].length;
        }

        let infractionsCount = {
            day: 0,
            week: 0,
            total: 0
        }

        let lastWarns = '';

        if (bot.warns[member.id]) {
            infractionsCount.total = Object.keys(bot.warns[member.id]).length;

            Object.keys(bot.warns[member.id]).forEach(entry => {
                if (Date.now() - entry <= '86400000') infractionsCount.day++
                if (Date.now() - entry <= '604800000') infractionsCount.week++
            });

            let userWarns = Object.entries(bot.warns[member.id]).map((e) => ( { [e[0]]: e[1] } ));

            for (let i = 0; i < 10; i++) {
                if (!userWarns[i]) continue;

                Object.keys(userWarns[i]).forEach((key) => {
                    let moderator = message.guild.members.cache.get(userWarns[i][key].moderator);
                    if (typeof moderator === "undefined") moderator = 'Moderador desconocido';
                    lastWarns = lastWarns + `\`${key}\` • ${moderator} • ${new Date(parseInt(key)).toLocaleString()}\n${userWarns[i][key].reason}\n\n`;
                })
            }

        }

        //Comprueba si existe el rol silenciado, y de no existir, lo crea
        let role = message.guild.roles.cache.find(r => r.name === 'Silenciado');
        if (!role) {
            role = await message.guild.createRole({
                name: 'Silenciado',
                color: '#818386',
                permissions: []
            });
            
            let botMember = message.guild.members.cache.get(bot.user.id);
            await message.guild.setRolePosition(role, botMember.roles.highest.position - 1);
            
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions (role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SPEAK: false
                });
            });
        };

        let sanction;
        if (bot.mutes[member.id]) {
            sanction = `Silenciado hasta ${new Date(bot.mutes[member.id].time).toLocaleString()}`;
        } else if (member.roles.cache.has(role.id)) {
            sanction = 'Silenciado indefinidamente';
        }

        let resultEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setTitle(`⚠ Infracciones`)
            .setDescription(`Mostrando las infracciones del usuario <@${member.id}>\nSanción actual: \`${sanction || 'Ninguna'}\``)
            .setThumbnail(user.displayAvatarURL())
            .addField(`Últimas 24h`, infractionsCount.day, true)
            .addField(`Últimos 7 días`, infractionsCount.week, true)
            .addField(`Total`, infractionsCount.total, true)
            .addField(`Últimas 10 infracciones`, lastWarns || 'Ninguna');
        
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    };
};
