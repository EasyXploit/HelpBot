exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //-userinfo (@usuario | id)

    try {
        let noUserEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} No has proporcionado un usuario válido`);

        const member = await resources.fetchMember(message.guild, args[0] || message.author.id);
        if (!member) return message.channel.send(noUserEmbed);

        let user = member.user;

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
            warns = bot.warns[member.id].length;
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

        let translations = require(`../../resources/texts/translations.json`);

        let matches = [];

        permsArray.forEach(async (perm) => {
            matches.push(translations[perm]);
        });

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

        let infractionsCount = 0;
        if (bot.warns[member.id]) infractionsCount = Object.keys(bot.warns[member.id]).length;

        let resultEmbed = new discord.MessageEmbed ()
            .setColor(member.displayHexColor)
            .setTitle(`🙍 Información de usuario`)
            .setDescription(`Mostrando información acerca del usuario <@${member.id}>\nSanción actual: \`${sanction || 'Ninguna'}\``)
            .setThumbnail(user.displayAvatarURL())
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
        
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
