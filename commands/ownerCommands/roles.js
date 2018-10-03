exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //$roles

    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(resources.GrayTick + ' **Función experimental**\nEstás ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed).then(msg => {msg.delete(5000)});

    try {
        let csgo = message.guild.roles.find(r => r.name === 'CS:GO');
        let r6 = message.guild.roles.find(r => r.name === 'RAINBOW SIX');
        let fortnite = message.guild.roles.find(r => r.name === 'FORTNITE');
        let rocketleague = message.guild.roles.find(r => r.name === 'ROCKET LEAGUE');
        let lol = message.guild.roles.find(r => r.name === 'LOL');
        let minecraft = message.guild.roles.find(r => r.name === 'MINECRAFT');
        let battlefield = message.guild.roles.find(r => r.name === 'BATTLEFIELD');
        let pubg = message.guild.roles.find(r => r.name === 'PUBG');
        let gtav = message.guild.roles.find(r => r.name === 'GTA V');
        let roblox = message.guild.roles.find(r => r.name === 'ROBLOX');
        let overwatch = message.guild.roles.find(r => r.name === 'OVERWATCH');

        let rolesEmbed = new discord.RichEmbed()
            .setColor(0xC8DE95)
            .setAuthor('ELIGE TUS ROLES', 'https://i.imgur.com/vGDH9YL.png')
            .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
            .setThumbnail('https://i.imgur.com/vGDH9YL.png')
            .setDescription('Reacciona con el emoji correspondiente al rol que quieras asignarte. En cualquier momento puedes quitarte un rol con el comando `' + config.prefix + 'comando_no_disponible`.')
            .addField('Ajustes (no disponibles temporalmente)', '● Reacciona con :newspaper: para asignarte el rol @NOTICIAS\n● Reacciona con :flag_es: para asignarte el rol @ES\n● Reacciona con :earth_americas: para asignarte el rol @LATAM', true)
            .addField('Videojuegos', '● Reacciona con :bomb: para asignarte el rol `@CS:GO`\n● Reacciona con :boom: para asignarte el rol `@RAINBOW SIX`\n● Reacciona con :hammer_pick: para asignarte el rol `@FORTNITE`\n● Reacciona con 🚀 para asignarte el rol `@ROCKET LEAGUE`\n● Reacciona con 🌟 para asignarte el rol `@LOL`\n● Reacciona con ⛏ para asignarte el rol `@MINECRAFT`\n● Reacciona con ⚜ para asignarte el rol `@BATTLEFIELD`\n● Reacciona con 🔫 para asignarte el rol `@PUBG`\n● Reacciona con 🚔 para asignarte el rol `@GTA V`\n● Reacciona con 📦 para asignarte el rol `@ROBLOX`\n● Reacciona con ⚡ para asignarte el rol `@OVERWATCH`\n\n_Si hay algún rol que no está en la lista y te gustaría que añadiésemos, envíanos un mensaje a <#449289541866749953>_', true);
        message.channel.send(rolesEmbed).then(() => message.react('💣')).then(() => message.react('💥')).then(() => message.react('⚒')).then(() => message.react('🚀')).then(() => message.react('🌟')).then(() => message.react('⛏')).then(() => message.react('⚜')).then(() => message.react('🔫')).then(() => message.react('🚔')).then(() => message.react('📦')).then(() => message.react('⚡'));

        const filter = (reaction, user) => {
            return ['💣', '💥', '⚒', '🚀', '🌟', '⛏', '⚜', '🔫', '🚔', '📦', '⚡'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        message.awaitReactions(filter, { max: 11, time: 15000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if (collected.has(emoji.name === '💣')) {
                    message.member.addRole(csgo)
                };
                if (collected.has(emoji.name === '💥')) {
                    message.member.addRole(r6)
                };
                if (collected.has(emoji.name === '⚒')) {
                    message.member.addRole(fortnite)
                };
                if (collected.has(emoji.name === '🚀')) {
                    message.member.addRole(rocketleague)
                };
                if (collected.has(emoji.name === '🌟')) {
                    message.member.addRole(lol)
                };
                if (collected.has(emoji.name === '⛏')) {
                    message.member.addRole(minecraft)
                };
                if (collected.has(emoji.name === '⚜')) {
                    message.member.addRole(battlefield)
                };
                if (collected.has(emoji.name === '🔫')) {
                    message.member.addRole(pubg)
                };
                if (collected.has(emoji.name === '🚔')) {
                    message.member.addRole(gtav)
                };
                if (collected.has(emoji.name === '📦')) {
                    message.member.addRole(roblox)
                };
                if (collected.has(emoji.name === '⚡')) {
                    message.member.addRole(overwatch)
                };
            message.channel.send('¡Listo!')
            })

            .catch(collected => {
                console.log(`Después de 15 segundos, solo se seleccionaron ${collected.size} de 4 roles.`);
                message.reply('No reaccionaste en menos de 15 segundos.');
            });

        /*.then(async function (message) {
            for (count = 0; count < UTFemojis.length; count++) {
                await message.react(UTFemojis[count]);
            }
        })*/

        //await message.react(args[2]);

        //console.log('\n 》' + message.author.username + ' se añadió el rol ');

    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
