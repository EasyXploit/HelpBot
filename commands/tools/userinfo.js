exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!userinfo (@usuario | id)

    try {
        let noUserEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} No has proporcionado un usuario válido`);

        const member = await client.functions.fetchMember(message.guild, args[0] || message.author.id);
        if (!member) return message.channel.send({ embeds: [noUserEmbed] });

        let user = member.user;

        //Comprueba si el usuario es baneable
        let bannable = `No`;

        if (member.bannable === true) {
            bannable = `Si`
        };

        //Comprueba los permisos del usuario
        let status = [];
        if (member.id === message.guild.ownerId) {
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
        if (!client.warns[member.id]) {
            warns = 0
        } else {
            warns = client.warns[member.id].length;
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

        let translations = require(`../../resources/data/permsTranslations.json`);

        let matches = [];

        permsArray.forEach(async (perm) => {
            matches.push(translations[perm]);
        });

        //Comprueba si existe el rol silenciado, sino lo crea
        let role = await client.functions.checkMutedRole(message.guild);

        let sanction;
        if (client.mutes[member.id]) {
            sanction = `Silenciado hasta ${new Date(client.mutes[member.id].time).toLocaleString()}`;
        } else if (member.roles.cache.has(role.id)) {
            sanction = 'Silenciado indefinidamente';
        }

        let infractionsCount = 0;
        if (client.warns[member.id]) infractionsCount = Object.keys(client.warns[member.id]).length;

        let resultEmbed = new discord.MessageEmbed()
            .setColor(member.displayHexColor)
            .setTitle(`🙍 Información de usuario`)
            .setDescription(`Mostrando información acerca del usuario **${member.user.tag}**\nSanción actual: \`${sanction || 'Ninguna'}\``)
            .setThumbnail(user.displayAvatarURL({dynamic: true}))
            .addField(`🏷 TAG completo`, user.tag, true)
            .addField(`🆔 ID del usuario`, member.id, true)
            .addField(`⚒ Baneable`, bannable, true)
            .addField(`📝 Fecha de registro`, user.createdAt.toLocaleString(), true)
            .addField(`↙ Unido al servidor`, member.joinedAt.toLocaleString(), true)
            .addField(`👑 Estatus`, status.join(', '), true)
            .addField(`🎖 Rol más alto`, member.roles.highest.name, true)
            .addField(`💬 Último mensaje`, lastMessage, true)
            .addField(`⚖ Infracciones`, infractionsCount, true)
            .addField(`👮 Permisos`, `\`\`\`${matches.join(', ')}\`\`\``);
        
        message.channel.send({ embeds: [resultEmbed] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'userinfo',
    aliases: ['user']
};
