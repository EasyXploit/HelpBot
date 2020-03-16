exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //$roles

    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(resources.GrayTick + ' **Función experimental**\nEstás ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed).then(msg => {msg.delete(5000)});

    try {
        message.delete();
        
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
            .setColor(0xE2E5E7)
            .setAuthor('ELIGE TUS ROLES', 'https://i.imgur.com/TU8U8wq.png')
            .setFooter('© 2018 República Gamer LLC', resources.server.iconURL)
            .setThumbnail('https://i.imgur.com/TU8U8wq.png')
            .setDescription('Reacciona con el emoji correspondiente al rol que quieras asignarte. En cualquier momento puedes quitarte un rol retirando tu reacción.')
            .addField('Región', '● Reacciona con :flag_es: para asignarte el rol `@ES`\n● Reacciona con :earth_americas: para asignarte el rol `@LATAM`', true)
            .addField('Videojuegos', '● Reacciona con :bomb: para asignarte el rol `@CS:GO`\n● Reacciona con :boom: para asignarte el rol `@RAINBOW SIX`\n● Reacciona con :hammer_pick: para asignarte el rol `@FORTNITE`\n● Reacciona con 🚀 para asignarte el rol `@ROCKET LEAGUE`\n● Reacciona con 🌟 para asignarte el rol `@LOL`\n● Reacciona con ⛏ para asignarte el rol `@MINECRAFT`\n● Reacciona con ⚜ para asignarte el rol `@BATTLEFIELD`\n● Reacciona con 🔫 para asignarte el rol `@PUBG`\n● Reacciona con 🚔 para asignarte el rol `@GTA V`\n● Reacciona con 📦 para asignarte el rol `@ROBLOX`\n● Reacciona con ⚡ para asignarte el rol `@OVERWATCH`\n\n_Si hay algún rol que no está en la lista y te gustaría que añadiésemos, envíanos un mensaje a <#449289541866749953>_', true);
        message.channel.send(rolesEmbed).then(async function (message) {
            await message.react('🇪🇸');
            await message.react('🌎');
            await message.react('💣');
            await message.react('💥');
            await message.react('⚒');
            await message.react('🚀');
            await message.react('🌟');
            await message.react('⛏');
            await message.react('⚜');
            await message.react('🔫');
            await message.react('🚔');
            await message.react('📦');
            await message.react('⚡');
        });

    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
