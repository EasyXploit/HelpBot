exports.run = (event, discord, fs, config, keys, bot) => {
    
    const loggingChannel = bot.channels.get(config.loggingChannel);
    const welcomeChannel = bot.channels.get(config.welcomeChannel);
    const welcomeRole = event.guild.roles.find('name', 'NOVATOS');

    if (!event.user.bot) {
        
        const beta = bot.emojis.find('name', 'beta');

        var images = ['https://i.imgur.com/lDuMuSb.png', 'https://i.imgur.com/MJvm6NC.png', 'https://i.imgur.com/nPsX8TS.png', 'https://i.imgur.com/0dNTAZn.png', 'https://i.imgur.com/jiPcHl5.png', 'https://i.imgur.com/MQzdNf3.png', 'https://i.imgur.com/Z8MUU6q.png', 'https://i.imgur.com/XhHJfq0.png', 'https://i.imgur.com/O8TfwdN.png', 'https://i.imgur.com/sWbMJK2.png', 'https://i.imgur.com/ex700S4.png', 'https://i.imgur.com/GsLLEng.png'];

        var welcomes = ['Hola <@' + event.user.id + '> 🎇, bienvenid@ a la **República Gamer**. Recuerda leer la <#426464733764386828>\nPor lo demás, ¡Pásalo bien :wink:!  ' + beta, 'Hola <@' + event.user.id + '> ⚡, bienvenido a la comunidad. Esperamos que lo pases bien, pero antes de nada, recuerda echar un vistazo a la <#426464733764386828> 🔥 ' + beta, 'Hola <@' + event.user.id + '> 🎊, ¡gracias por entrar a formar parte de nuestra comunidad!. Antes de continuar, recuerda leer la <#426464733764386828>. ¡Cada vez somos más! 🏆 ' + beta, 'Hola <@' + event.user.id + '> 🏅, bienvenid@ a la **República Gamer**. Recuerda leer la <#426464733764386828>, ¡y no te olvides de invitar a tus amigos!\nPor lo demás, ¡Pásalo bien 🎮!  ' + beta]

        const newUser = event.user.username;
        
        if (newUser.startsWith('discord.gg/')) {
            
            event.guild.member(event.user).ban('No está permitido utilizar invitaciones de Discord como nombre de usuario')

            .catch ((err) => {
                console.error(new Date() + ' 》' + err);

                let errorEmbed = new discord.RichEmbed()
                    .setColor(0xF12F49)
                    .setTitle('❌ Ocurrió un error')
                    .setDescription('Ocurrió un error durante la ejecución del evento ' + event + '\nEl usuario ' + event.user.username + ' no fue expulsado automáticamente de la comunidad, por lo que será necesario emprender acciones de forma manual.');
                loggingChannel.send(errorEmbed);
            })
            
            console.log(new Date() + ' 》@' + event.user.username + ' intentó unirse a la República Gamer, pero fue baneado por que no está permitido utilizar invitaciones de Discord como nombre de usuario')

            let preventAccessEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setTimestamp()
                .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
                .addField('📑 Auditoría', '@' + event.user.username + ' intentó unirse a la República Gamer, pero fue baneado por que no está permitido utilizar invitaciones de Discord como nombre de usuario');
            loggingChannel.send(preventAccessEmbed);
            
        } else  {

            console.log(new Date() + ' 》@' + event.user.username + ' se unió a la República Gamer')

            event.guild.member(event.user).addRole(welcomeRole);

            let channelWelcomeEmbed = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setAuthor('Bienvenido a la República Gamer @' + event.user.username, 'https://i.imgur.com/LVmSQns.jpg')

                .setDescription(welcomes[Math.floor(Math.random() * welcomes.length)])
                .setThumbnail(images[Math.floor(Math.random() * images.length)]);
            welcomeChannel.send(channelWelcomeEmbed);

            let loggingWelcomeEmbed = new discord.RichEmbed()
                .setColor(0x98E646)
                .setTimestamp()
                .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
                .addField('📑 Auditoría', '@' + event.user.tag + ' se unió a la República Gamer ↙');
            loggingChannel.send(loggingWelcomeEmbed);

            let dmWelcomeEmbed = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setAuthor('REPÚBLICA GAMER', 'https://i.imgur.com/LVmSQns.jpg')
                .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
                .setTitle('Hola **' + event.user.username + '**, bienvenido a la __República Gamer__ :tada:')
                .setDescription('**¡Nos alegra que hayas decidido unirte a nuestra comunidad!**\nA continuación, te mostramos una breve guía sobre como empezar a participar en nuestro servidor. __¡Esperamos que lo pases bien!__')
                .addField('Guía de inicio rápido:', ':one: Entra en <#426464733764386828> y dedica unos segundos a leer las breves normas que rigen nuestra comunidad. Además, aprenderás a usar a los bots, a como obtener ayuda y a como subir de nivel.\n:two: Entra en <#440905255073349635> y elige los roles de tu preferencia. Esto desbloqueará catacterísticas especiales para determinados videojuegos. ' + beta + '\n:three: Entra en <#388699973866225676> y escribe `/create` para crear ¡tu propia sala temporal! (recuerda que desparecerá si no hay nadie en ella).\n:four: ¡Tan solo diviértete y trae a tus amigos para que nos conozcan! Mándales este enlace de invitación: https://discord.gg/eWx72Jy', true);
            event.user.send(dmWelcomeEmbed);
        }
    } else {
        let loggingWelcomeBotEmbed = new discord.RichEmbed()
            .setColor(0x4A90E2)
            .setTimestamp()
            .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
            .addField('📑 Auditoría', 'El **BOT** @' + event.user.username + ' fue añadido al servidor ↙');
        loggingChannel.send(loggingWelcomeBotEmbed)
        return;
    }
}
