exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-infractions (@miembro | id)

    try {
        let noUserEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} No has proporcionado un usuario válido`);

        let noBotsEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} No puedes obtener información de un bot`);

        let member;

        if (args.length < 1) {
            member = message.guild.members.cache.get(message.author.id);
        } else {
            member = await message.guild.members.fetch(message.mentions.users.first() || args[0]);
        }

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

        /* --- */

        //Fórmula para calcular cuándo aplicar las reglas de automoderación
        //Timestamp actual - Timestamp del warn -> ¿Es menor que el timestamp de la regla? -> True = match

        /* --- */

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
                    console.log(key);
                    lastWarns = lastWarns + `\`${key}\` • ${moderator} • ${new Date(parseInt(key)).toLocaleString()}\n${userWarns[i][key].reason}\n\n`;
                })
            }

        }

        let resultEmbed = new discord.MessageEmbed ()
            .setColor(resources.gold)
            .setTitle(`⚠ Infracciones`)
            .setDescription(`Mostrando las infracciones del usuario <@${member.id}>`)
            .setThumbnail(user.displayAvatarURL())
            .addField(`Últimas 24h`, infractionsCount.day, true)
            .addField(`Últimos 7 días`, infractionsCount.week, true)
            .addField(`Total`, infractionsCount.total, true)
            .addField(`Últimas 10 infracciones`, lastWarns || 'Ninguna');
        
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../../errorHandler.js').run(discord, config, bot, message, args, command, e);
    };
};
