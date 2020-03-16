exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //-userinfo (@usuario | id)

    try {
        let noUserEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} No has proporcionado un usuario válido`);

        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} No puedes obtener información de un bot`);

        let member;

        if (args.length < 1) {
            member = message.guild.members.get(message.author.id);
        } else {
            member = await message.guild.fetchMember(message.mentions.users.first() || args[0]);
        }

        if (!member) return message.channel.send(noUserEmbed);

        let user = member.user;
        if (user.bot) return message.channel.send(noBotsEmbed);

        //Comprueba si el usuario es baneable
        let bannable = `No`;

        if (member.bannable === true) {
            bannable = `Si`
        };

        //Comprueba los permisos del usuario
        let status = [];
        if (member.id === message.guild.owner.id) {
            status.push(`Propietario`)
        };
        
        if (member.hasPermission(`ADMINISTRATOR`)) {
            status.push(`Administrador`)
        };
        
        if (member.hasPermission(`MANAGE_MESSAGES`)) {
            status.push(`Moderador`)
        };

        if (status.length < 1) {
            status.push(`Usuario regular`)
        };

        let perms = member.permissions.serialize();
        let permsArray = Object.keys(perms).filter(function (x) {
            return perms[x] !== false;
        });

        //Comprueba el número de warns del usuario
        let warns;
        if (!bot.warns[member.id]) {
            warns = 0
        } else {
            warns = bot.warns[member.id].warns
        }
        
        let lastMessage;
            
        if (member.lastMessage) {
            if (member.lastMessage.content.length >= 995) {
                lastMessage = `${member.lastMessage.content.substr(0, 995)} ... (ID: ${member.lastMessage.id})`;
            } else {
                lastMessage = `${member.lastMessage} (ID: ${member.lastMessage.id})`;
            }
        } else {
            lastMessage = `Ninguno en caché`;
        }

        let resultEmbed = new discord.RichEmbed()
            .setColor(member.displayHexColor)
            .setTitle(`🙍 Información de usuario`)
            .setDescription(`Mostrando información acerca del usuario <@${member.id}>`)
            .setThumbnail(user.displayAvatarURL)
            .addField(`ℹ Nickname`, member.displayName, true)
            .addField(`🏷 TAG completo`, user.tag, true)
            .addField(`🆔 ID del usuario`, member.id, true)
            .addField(`👮 Permisos`, permsArray.join(', ').toLowerCase(), true)
            .addField(`⚒ Baneable`, bannable, true)
            .addField(`📝 Fecha de registro`, user.createdAt.toLocaleString(), true)
            .addField(`↙ Unido al servidor`, member.joinedAt.toLocaleString(), true)
            .addField(`👑 Estatus`, status.join(', '), true)
            .addField(`🎖 Rol más alto`, member.highestRole.name, true)
            .addField(`💬 Último mensaje`, lastMessage, true)
            .addField(`⚖ Infracciones`, warns, true)
        message.channel.send(resultEmbed);
    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
