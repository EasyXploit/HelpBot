exports.run = async (event, discord, fs, config, keys, bot, resources) => {
    
    try {
        //Previene que continue la ejecución si el servidor no es la República Gamer
        if (event.guild.id !== `374945492133740544`) return;

        const loggingChannel = bot.channels.cache.get(config.loggingChannel);
        const welcomeChannel = bot.channels.cache.get(config.welcomeChannel);

        if (!event.user.bot) {

            const images = ['https://i.imgur.com/lDuMuSb.png', 'https://i.imgur.com/MJvm6NC.png', 'https://i.imgur.com/nPsX8TS.png', 'https://i.imgur.com/0dNTAZn.png', 'https://i.imgur.com/jiPcHl5.png', 'https://i.imgur.com/MQzdNf3.png', 'https://i.imgur.com/Z8MUU6q.png', 'https://i.imgur.com/XhHJfq0.png', 'https://i.imgur.com/O8TfwdN.png', 'https://i.imgur.com/sWbMJK2.png', 'https://i.imgur.com/ex700S4.png', 'https://i.imgur.com/GsLLEng.png'];

            const welcomes = [`Hola <@${event.user.id}> 🎇, bienvenid@ a la **República Gamer**. Recuerda leer la <#498455357853794304>\nPor lo demás, ¡Pásalo bien :wink:!`, `Hola <@${event.user.id}> ⚡, bienvenido a la comunidad. Esperamos que lo pases bien, pero antes de nada, recuerda echar un vistazo a la <#498455357853794304> 🔥`, `Hola <@${event.user.id}> 🎊, ¡gracias por entrar a formar parte de nuestra comunidad!. Antes de continuar, recuerda leer la <#498455357853794304>. ¡Cada vez somos más! 🏆`, `Hola <@${event.user.id}> 🏅, bienvenid@ a la **República Gamer**. Recuerda leer la <#498455357853794304>, ¡y no te olvides de invitar a tus amigos!\nPor lo demás, ¡Pásalo bien 🎮!`]

            const prohibitedNames = [`http://`, `https://`, `discord.gg`, `www.`, `.tv`, `twitch.tv`, `.net`, `.com`, `twitter.com`, `paypal.me`, `.me`, `donate.`, `.gg`, `binzy`];

            if(prohibitedNames.some(word => event.user.username.toLowerCase().includes(word))) {

                event.guild.member(event.user).ban(`No está permitido utilizar enlaces como nombre de usuario`)

                .catch ((err) => {
                    console.error(`${new Date().toLocaleString()} 》${err}`);

                    let errorEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setTitle(`${resources.RedTick} Ocurrió un error`)
                        .setDescription(`Ocurrió un error durante la ejecución del evento ${event}\nEl usuario ${event.user.username} no fue expulsado automáticamente de la comunidad, por lo que será necesario emprender acciones de forma manual.`);
                    loggingChannel.send(errorEmbed);
                })

                console.log(`${new Date().toLocaleString()} 》@${event.user.username} intentó unirse a la República Gamer, pero fue baneado por que no está permitido utilizar enlaces como nombre de usuario`)

                let preventAccessEmbed = new discord.MessageEmbed()
                    .setColor(resources.red)
                    .setTitle(`📑 Auditoría`)
                    .setDescription(`@${event.user.username} intentó unirse a la República Gamer, pero fue baneado por que no está permitido utilizar enlaces como nombre de usuario`)
                    .addField(`🏷 TAG completo`, event.user.tag, true)
                    .addField(`🆔 ID del usuario`, event.user.id, true)
                    .addField(`📝 Fecha de registro`, event.user.createdAt.toLocaleString(), true)
                    .setTimestamp();
                loggingChannel.send(preventAccessEmbed);

            } else  {

                console.log(`${new Date().toLocaleString()} 》@${event.user.tag} se unió a la guild: ${event.guild.name}`)


                /* --- CANVAS --- */

                const Canvas = require('canvas');
                
                //Crea el lienzo
                const canvas = Canvas.createCanvas(700, 250); //Inicializa el lienzo. 700x250px
                const context = canvas.getContext('2d'); //Indica que el  contexto es en 2 dimensiones

                //Ajusta la imagen al lienzo
                const background = await Canvas.loadImage('./resources/images/wallpaper.png'); //Carga la imagen de fondo
                context.drawImage(background, 0, 0, canvas.width, canvas.height);

                //Crea un borde
                context.strokeStyle = '#74037b';
                context.strokeRect(0, 0, canvas.width, canvas.height);

                // Añade el nombre de usuario
                context.font = '60px sans-serif';
                context.fillStyle = '#ffffff';
                context.fillText(event.displayName, canvas.width / 2.5, canvas.height / 1.8);

                //Redondea el marco del avatar
                context.beginPath();
                context.arc(125, 125, 100, 0, Math.PI * 2, true);
                context.closePath();
                context.clip();

                //Añade el avatar del usuario
                const avatar = await Canvas.loadImage(event.user.displayAvatarURL({ format: 'jpg' }));
                context.drawImage(avatar, 25, 25, 200, 200);

                //Adjunta y envía la foto
                const attachment = new discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
                await welcomeChannel.send(attachment);

                /* --- --- */


                
                let channelWelcomeEmbed = new discord.MessageEmbed()
                    .setColor(resources.gold)
                    .setAuthor(`Bienvenido a la República Gamer @${event.user.username}`, event.user.displayAvatarURL())
                    .setDescription(welcomes[Math.floor(Math.random() * welcomes.length)])
                    .setThumbnail(images[Math.floor(Math.random() * images.length)]);

                let loggingWelcomeEmbed = new discord.MessageEmbed()
                    .setColor(resources.green2)
                    .setThumbnail(`https://i.imgur.com/A60x2Di.png`)
                    .setAuthor(`Nuevo miembro`, event.user.displayAvatarURL())
                    .setDescription(`${event.user.username} se unió al servidor`)
                    .addField(`🏷 TAG completo`, event.user.tag, true)
                    .addField(`🆔 ID del usuario`, event.user.id, true)
                    .setFooter(event.guild.name, event.guild.iconURL()).setTimestamp()

                let dmWelcomeEmbed = new discord.MessageEmbed()
                    .setColor(resources.gold)
                    .setAuthor(`REPÚBLICA GAMER`, event.user.displayAvatarURL())
                    .setImage(`https://i.imgur.com/IeExpLO.png`)
                    .setTitle(`Hola **${event.user.username}**, bienvenido a la __República Gamer__ :tada:`)
                    .setDescription(`**¡Nos alegra que hayas decidido unirte a nuestra comunidad!**\nA continuación, te mostramos una breve guía sobre como empezar a participar en nuestro servidor. __¡Esperamos que lo pases bien!__`)
                    .addField(`Guía de inicio rápido:`, `:one: Entra en <#498455357853794304> y dedica unos segundos a leer las breves normas que rigen nuestra comunidad. Además, aprenderás a usar a los bots, a como obtener ayuda y a como subir de nivel.\n:two: Entra en <#440905255073349635> y elige los roles de tu preferencia. Esto desbloqueará catacterísticas especiales para determinados videojuegos. ${resources.beta}\n:three: Entra en <#388699973866225676> y escribe ` + '`/create`' + ` para crear ¡tu propia sala temporal! (recuerda que desparecerá si no hay nadie en ella).\n:four: ¡Tan solo diviértete y trae a tus amigos para que nos conozcan! Mándales este enlace de invitación: https://discord.gg/eWx72Jy`, true)
                    .setFooter(`© 2020 República Gamer S.L.`, resources.server.iconURL());

                await welcomeChannel.send(channelWelcomeEmbed);
                await loggingChannel.send(loggingWelcomeEmbed);
                await event.user.send(dmWelcomeEmbed);
                
            }
        } else {
            if (event.guild.member(event.user).roles.cache.has(`426789294007517205`)) return;
            event.guild.member(event.user).roles.add(`426789294007517205`);

            let loggingWelcomeBotEmbed = new discord.MessageEmbed()
                .setColor(resources.blue)
                .setTimestamp()
                .setFooter(`© 2020 República Gamer S.L.`, resources.server.iconURL())
                .addField(`📑 Auditoría`, `El **BOT** @${event.user.username} fue añadido al servidor ↙`);
            loggingChannel.send(loggingWelcomeBotEmbed)
            return;
        }
    } catch (e) {

        let error = e.stack;
        if (error.length > 1014) error = error.slice(0, 1014);
        error = error + ' ...';

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.MessageEmbed()
            .setColor(resources.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `guildMemberAdd`, true)
            .addField(`Fecha:`, new Date().toLocaleString(), true)
            .addField(`Error:`, `\`\`\`${error}\`\`\``, )
            .setFooter(new Date().toLocaleString(), resources.server.iconURL()).setTimestamp();
        
        //Se envía el mensaje al canal de depuración
        await bot.channels.cache.get(config.debuggingChannel).send(debuggEmbed);
    }
}
