exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //$presence (status | activity) (online | offline | idle | dnd - membersCount - nombre de la actividad)
    
    try {

        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis del comando es \`${config.ownerPrefix}presence (status | activity) (online | offline | idle | dnd - membersCount - nombre de la actividad)\``);

        if (!args[0] || !args[1]) return message.channel.send(noCorrectSyntaxEmbed);

        let toModify = args[0];
        let newValue = args.slice(1).join(' ');
        let changed;

        if (toModify !== 'status' && toModify !== 'activity') return message.channel.send(noCorrectSyntaxEmbed);

        let actuallyConfiguredEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Esta configuración ya ha sido aplicada`);

        if (toModify === 'status') {
            if (newValue !== 'online' && newValue !== 'invisible' && newValue !== 'idle' && newValue !== 'dnd') return message.channel.send(noCorrectSyntaxEmbed);
            if (newValue === config.status) return message.channel.send(actuallyConfiguredEmbed);
            config.status = newValue;

            //Graba la configuración
            await fs.writeFile('./configs/config.json', JSON.stringify(config, null, 4), (err) => console.error);
            await client.user.setStatus(config.status);

            changed = 'el estado';
        } else if (toModify === 'activity') {
            if (newValue === config.game) return message.channel.send(actuallyConfiguredEmbed);
            config.game = newValue;

            //Graba la configuración
            await fs.writeFile('./configs/config.json', JSON.stringify(config, null, 4), (err) => console.error);

            if (newValue === 'membersCount') {
                config.game = 'membersCount';

                let usersCount = client.homeGuild.members.cache.filter(member => !member.user.bot).size;

                await client.user.setPresence({
                    status: config.status,
                    activity: {
                        name: `${usersCount} usuarios | !ayuda`,
                        type: config.type
                    }
                });
            } else {
                await client.user.setPresence({
                    status: config.status,
                    activity: {
                        name: config.game,
                        type: config.type
                    }
                });
            };

            changed = 'la actividad';   
        };

        let resultEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setTitle(`${resources.GreenTick} Operación en marcha`)
            .setDescription(`Cambiaste ${changed} del bot a \`${newValue}\`.\nEsta operación podría tardar unos minutos en completarse.`)

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.blue)
            .setTitle('📑 Auditoría - [PRESENCIA]')
            .setDescription(`${message.author.tag} cambió ${changed} del bot a \`${newValue}\`.`);

        await loggingChannel.send(loggingEmbed);
        await message.channel.send(resultEmbed)
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};
