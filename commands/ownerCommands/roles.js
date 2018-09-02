exports.run = async (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {

    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed);

    async function setupRole() {
        try {
            const UTFemojis = ['📰', '🇪🇸', '🌎', '💣', '💥', '⚒'];

            let rolesEmbed = new discord.RichEmbed()
                .setColor(0xC8DE95)
                .setAuthor('ELIGE TUS ROLES', 'https://i.imgur.com/vGDH9YL.png')
                .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
                .setThumbnail('https://i.imgur.com/vGDH9YL.png')
                .setDescription('Reacciona con el emoji correspondiente al rol que quieras asignarte. En cualquier momento puedes quitarte un rol con el comando `' + config.prefix + 'comando_no_disponible`.')
                .addField('Ajustes', '● Reacciona con :newspaper: para asignarte el rol @NOTICIAS\n● Reacciona con :flag_es: para asignarte el rol @ES\n● Reacciona con :earth_americas: para asignarte el rol @LATAM', true)
                .addField('Videojuegos', '● Reacciona con :bomb: para asignarte el rol <@440906652187885590>\n● Reacciona con :boom: para asignarte el rol <@440906748585574410>\n● Reacciona con :hammer_pick: para asignarte el rol <@440930574039777282>\n\n_Si hay algún rol que no está en la lista y te gustaría que añadiésemos, envíanos un mensaje a <#449289541866749953>_', true);
            message.channel.send(rolesEmbed)

            .then(async function (message) {
                for (count = 0; count < UTFemojis.length; count++) {
                    await message.react(UTFemojis[count]);
                }
            })   

            //await message.react(args[2]);

            //console.log('\n 》' + message.author.username + ' se añadió el rol ');

        } catch (e) {
            console.error(new Date().toUTCString() + ' 》' + e);
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .addField('❌ Se declaró el siguiente error durante la ejecución del comando:', e, true);
            message.channel.send(errorEmbed);
            return;
        }
    }
    setupRole();
}
