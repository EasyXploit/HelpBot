exports.run = async (client, message, args, command, commandConfig) => {
    
    //!tempban (@usuario | id) (xS | xM | xH | xD) (motivo)
    
    try {
        
        let notToBanEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.\nSi el usuario no está en el servidor, has de especificar su ID`);

        let noReasonEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un motivo`);
        
        let alreadyBannedEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Este usuario ya ha sido baneado`);
        
        let noCorrectTimeEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una unidad de medida de tiempo. Por ejemplo: \`5s\`, \`10m\`, \`12h\` o \`3d\``);
        
        if (!args[0]) return message.channel.send({ embeds: [notToBanEmbed] });
    
        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        const user = await client.functions.fetchUser(args[0]);
        if (!user) return message.channel.send({ embeds: [notToBanEmbed] });
        
        let moderator = await client.functions.fetchMember(message.guild, message.author.id);
        const member = await client.functions.fetchMember(message.guild, user.id);

        if (member) {
            //Se comprueba si puede banear al usuario
            if (moderator.roles.highest.position <= member.roles.highest.position) {

                let cannotBanHigherRoleEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} No puedes banear a un miembro con un rol igual o superior al tuyo`);
    
                return message.channel.send({ embeds: [cannotBanHigherRoleEmbed] });
            };
        };
        
        //Se comprueba si el usuario ya estaba baneado
        let bans = await message.guild.bans.fetch();

        async function checkBans (bans) {
            for (const item of bans) if (item[0] === user.id) return true;
        };

        let banned = await checkBans(bans);
        if (banned) return message.channel.send({ embeds: [alreadyBannedEmbed] });

        //Comprueba la longitud del tiempo proporcionado
        if (!args[1] || args[1].length < 2) return message.channel.send({ embeds: [noCorrectTimeEmbed] });

        //Divide el tiempo y la unidad de medida proporcionados
        let time = args[1].slice(0, -1);
        let measure = args[1].slice(-1).toLowerCase();

        //Comprueba si se ha proporcionado un número.
        if (isNaN(time)) return message.channel.send({ embeds: [noCorrectTimeEmbed] });

        //Comprueba si se ha proporcionado una nunida de medida válida
        if (measure !== `s` && measure !== `m` && measure !== `h` && measure !== `d`) return message.channel.send({ embeds: [noCorrectTimeEmbed] });

        let milliseconds;

        function stoms(seg) {
            milliseconds = seg * 1000
        }

        function mtoms(min) {
            milliseconds = min * 60000
        }

        function htoms(hour) {
            milliseconds = hour * 3600000
        }

        function dtoms(day) {
            milliseconds = day * 86400000
        } 

        switch (measure) {
            case `s`:
                stoms(time);
                break;
            case `m`:
                mtoms(time);
                break;
            case `h`:
                htoms(time);
                break;
            case `d`:
                dtoms(time);
                break;
        }

        //Genera un mensaje de confirmación
        let successEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} **${user.tag}** ha sido baneado temporalmente, ¿alguien más?`);
        
        //Almacena la razón
        let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
        let reason = message.content.slice(toDeleteCount)

        //Si se ha proporcionado razón, la adjunta al mensaje de confirmación
        if (reason) successEmbed.setDescription(`${client.customEmojis.orangeTick} **${user.tag}** ha sido baneado temporalmente debido a **${reason}**, ¿alguien más?`);

        //Esto comprueba si se debe proporcionar razón
        if (!reason && message.author.id !== message.guild.ownerId) return message.channel.send({ embeds: [noReasonEmbed] });
        if (!reason) reason = 'Indefinida';

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: '[BANEADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)
            .addField(`Duración`, args[1], true);
        
        client.bans[user.id] = {
            time: Date.now() + milliseconds
        }

        client.fs.writeFile(`./databases/bans.json`, JSON.stringify(client.bans, null, 4), async err => {
            if (err) throw err;

            if (member) await user.send({ embeds: [toDMEmbed] });
            await message.guild.members.ban(user, {reason: `Moderador: ${message.author.id}, Duración: ${args[1]}, Razón: ${reason}`});
            await message.channel.send({ embeds: [successEmbed] });
        });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'tempban',
    aliases: []
};
