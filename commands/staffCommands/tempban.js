exports.run = async (discord, fs, client, message, args, command, supervisorsRole, noPrivilegesEmbed) => {
    
    //-tempban (@usuario | id) (xS | xM | xH | xD) (motivo)
    
    try {
        if (message.author.id !== client.config.guild.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let notToBanEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.\nSi el usuario no está en el servidor, has de especificar su ID`);

        let noReasonEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} Debes proporcionar un motivo`);
        
        let alreadyBannedEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} Este usuario ya ha sido baneado`);
        
        let noCorrectTimeEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} Debes proporcionar una unidad de medida de tiempo. Por ejemplo: \`5s\`, \`10m\`, \`12h\` o \`3d\``);
        
        if (!args[0]) return message.channel.send(notToBanEmbed);
    
        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        const user = await client.functions.fetchUser(args[0]);
        if (!user) return message.channel.send(notToBanEmbed);
        
        let moderator = await client.functions.fetchMember(message.guild, message.author.id);
        const member = await client.functions.fetchMember(message.guild, user.id);

        if (member) {
            //Se comprueba si puede banear al usuario
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed)
        }
        
        //Se comprueba si el usuario ya estaba baneado
        let bans = await message.guild.fetchBans();

        async function checkBans (bans) {
            for (const item of bans) if (item[0] === user.id) return true;
        };

        let banned = await checkBans(bans);
        if (banned) return message.channel.send(alreadyBannedEmbed);

        //Comprueba la longitud del tiempo proporcionado
        if (!args[1] || args[1].length < 2) return message.channel.send(noCorrectTimeEmbed);

        //Divide el tiempo y la unidad de medida proporcionados
        let time = args[1].slice(0, -1);
        let measure = args[1].slice(-1).toLowerCase();

        //Comprueba si se ha proporcionado un número.
        if (isNaN(time)) return message.channel.send(noCorrectTimeEmbed);

        //Comprueba si se ha proporcionado una nunida de medida válida
        if (measure !== `s` && measure !== `m` && measure !== `h` && measure !== `d`) return message.channel.send(noCorrectTimeEmbed);

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
        
        let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 

        //Esto comprueba si se debe proporcionar razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = 'Indefinida';

        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.emotes.greenTick} Operación completada`)
            .setDescription(`El usuario ${user.tag} ha sido baneado, ¿alguien más?`);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setAuthor(`[BANEADO]`, message.guild.iconURL())
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)
            .addField(`Duración`, args[1], true);
        
        client.bans[user.id] = {
            time: Date.now() + milliseconds
        }

        fs.writeFile(`./databases/bans.json`, JSON.stringify(client.bans, null, 4), async err => {
            if (err) throw err;

            await message.delete();

            if (member) await user.send(toDMEmbed);
            await message.guild.members.ban(user, {reason: `Moderador: ${message.author.id}, Duración: ${args[1]}, Razón: ${reason}`});
            await message.channel.send(successEmbed);
        });
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
