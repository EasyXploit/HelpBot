exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!presence (status | name | type | membersCount) (online | offline | idle | dnd - PLAYING | STREAMING | LISTENING | WATCHING | COMPETING - nombre de la actividad - enable | disable)
    
    try {

        const noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis del comando es \`${client.config.guild.prefix}presence (status | name | type | membersCount) (online | offline | idle | dnd - PLAYING | STREAMING | LISTENING | WATCHING | COMPETING - nombre de la actividad - enable | disable)\``);

        if (!args[0] || !args[1]) return message.channel.send(noCorrectSyntaxEmbed);

        let option = args[0].toLowerCase();
        let newValue = args.slice(1).join(' ');
        let changed;

        if (option !== 'status' && option !== 'name' && option !== 'type' && option !== 'memberscount') return message.channel.send(noCorrectSyntaxEmbed);

        let actuallyConfiguredEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Esta configuración ya ha sido aplicada`);

        if (option === 'status') { //ESTADO DEL BOT
            if (newValue.toLowerCase() !== 'online' && newValue.toLowerCase() !== 'invisible' && newValue.toLowerCase() !== 'idle' && newValue.toLowerCase() !== 'dnd') return message.channel.send(noCorrectSyntaxEmbed);
            if (newValue.toLowerCase() === client.config.presence.status) return message.channel.send(actuallyConfiguredEmbed);
            client.config.presence.status = newValue.toLowerCase();
            changed = 'el estado';
        } else if (option === 'type') { //TIPO DE ACTIVIDAD DEL BOT
            if (newValue.toUpperCase() !== 'PLAYING' && newValue.toUpperCase() !== 'STREAMING' && newValue.toUpperCase() !== 'LISTENING' && newValue.toUpperCase() !== 'WATCHING' && newValue.toUpperCase() !== 'COMPETING') return message.channel.send(noCorrectSyntaxEmbed);
            if (newValue.toUpperCase() === client.config.presence.type) return message.channel.send(actuallyConfiguredEmbed);
            client.config.presence.type = newValue.toUpperCase();
            changed = 'el tipo';   
        } else if (option === 'name') { //NOMBRE DE LA ACTIVIDAD DEL BOT
            if (newValue === client.config.presence.name) return message.channel.send(actuallyConfiguredEmbed);
            client.config.presence.name = newValue;
            changed = 'la actividad';   
        } else if (option === 'memberscount') { //CONTEO DE MIEMBROS DE LA GUILD
            if (newValue.toLowerCase() !== 'enable' && newValue.toLowerCase() !== 'disable') return message.channel.send(noCorrectSyntaxEmbed);
            if (newValue.toLowerCase() === 'enable' && client.config.presence.membersCount || newValue.toLowerCase() === 'disable' && !client.config.presence.membersCount) return message.channel.send(actuallyConfiguredEmbed);
            newValue.toLowerCase() === 'enable' ? client.config.presence.membersCount = true : client.config.presence.membersCount = false;
            changed = 'el conteo de miembros';
        };

        //Graba la configuración
        await client.fs.writeFile('./configs/presence.json', JSON.stringify(client.config.presence, null, 4), (err) => console.error(err));

        //Ajusta la nueva presencia
        await client.user.setPresence({
            status: client.config.presence.status,
            activity: {
                name: client.config.presence.membersCount ? `${client.homeGuild.members.cache.filter(member => !member.user.bot).size} miembros | ${client.config.presence.name}` : client.config.presence.name,
                type: client.config.presence.type
            }
        });

        const resultEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.customEmojis.greenTick} Operación en marcha`)
            .setDescription(`Cambiaste ${changed} del bot a \`${newValue}\`.\nEsta operación podría tardar unos minutos en completarse.`)

        const loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.blue)
            .setTitle('📑 Auditoría - [PRESENCIA]')
            .setDescription(`${message.author.tag} cambió ${changed} del bot a \`${newValue}\`.`);

        //Confirma la aplicación de los cambios
        await client.functions.loggingManager(loggingEmbed);
        await message.channel.send(resultEmbed)
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'presence',
    aliases: []
};
