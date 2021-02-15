exports.run = async (event, discord, fs, config, keys, client, resources) => {
    
    try {
        //Previene que continue la ejecución si el servidor no es la República Gamer
        if (event.guild.id !== `374945492133740544`) return;

        const loggingChannel = client.channels.cache.get(config.loggingChannel);
        const welcomeChannel = client.channels.cache.get(config.welcomeChannel);

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
                /* --- CANVAS --- */

                // Pass the entire Canvas object because you'll need to access its width, as well its context
                const applyText = (canvas, text) => {
                    const ctx = canvas.getContext('2d');

                    // Declare a base size of the font
                    let fontSize = 70;

                    do {
                        // Assign the font to the context and decrement it so it can be measured again
                        ctx.font = `${fontSize -= 10}px sans-serif`;
                        // Compare pixel width of the text to the canvas minus the approximate avatar size
                    } while (ctx.measureText(text).width > canvas.width - 300);

                    // Return the result to use in the actual canvas
                    return ctx.font;
                };

                const Canvas = require('canvas');
                
                //Crea el lienzo
                const canvas = Canvas.createCanvas(675, 250); //Inicializa el lienzo. 700x250px
                const ctx = canvas.getContext('2d'); //Almacena el contexto (que es el lienzo) e indica que se trabajará con herramientas en 2D

                //Añade un fondo negro al lienzo
                ctx.beginPath();
                ctx.rect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#090A0B";
                ctx.fill();

                //Crea un borde
                ctx.strokeStyle = '#FFC857';
                ctx.lineWidth = 3;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);

                // Slightly smaller text placed above the member's display name
                ctx.font = '28px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('¡Bienvenid@ al servidor,', canvas.width / 2.5, canvas.height / 3.5);

                // Añade el nombre de usuario
                ctx.font = applyText(canvas, `${event.displayName}!`);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(event.displayName, canvas.width / 2.5, canvas.height / 1.8);

                //Redondea el marco del avatar
                ctx.beginPath();
                ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();

                //Añade el avatar del usuario
                const avatar = await Canvas.loadImage(event.user.displayAvatarURL({ format: 'jpg' }));
                ctx.drawImage(avatar, 25, 25, 200, 200);

                //Adjunta y envía la foto
                const attachment = new discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
                await welcomeChannel.send(attachment);

                /* --- --- */


                
                /*let channelWelcomeEmbed = new discord.MessageEmbed()
                    .setColor(resources.gold)
                    .setAuthor(`Bienvenido a la República Gamer @${event.user.username}`, event.user.displayAvatarURL())
                    .setDescription(welcomes[Math.floor(Math.random() * welcomes.length)])
                    .setThumbnail(images[Math.floor(Math.random() * images.length)]);*/

                let loggingWelcomeEmbed = new discord.MessageEmbed()
                    .setColor(resources.green)
                    .setThumbnail(event.user.displayAvatarURL())
                    .setAuthor(`Nuevo miembro`, `https://i.imgur.com/A60x2Di.png`)
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
                    .addField(`Guía de inicio rápido:`, `:one: Entra en <#498455357853794304> y dedica unos segundos a leer las breves normas que rigen nuestra comunidad. Además, aprenderás a usar a los bots, a como obtener ayuda y a como subir de nivel.\n:two: Entra en \`⚡ | Crear sala\` para crear ¡tu propia sala temporal! (recuerda que desparecerá si no hay nadie en ella).\n:three: ¡Tan solo diviértete y trae a tus amigos para que nos conozcan! Mándales este enlace de invitación: https://discord.gg/eWx72Jy\n\n**AVISO:** Debes haber verificado tu cuenta de Discord desde el enlace de confirmación enviado a tu dirección de correo electrónico para poder participar en la comunidad.`, true);

                //await welcomeChannel.send(channelWelcomeEmbed);
                await loggingChannel.send(loggingWelcomeEmbed);
                await event.user.send(dmWelcomeEmbed);
                
            }
        } else {
            if (event.guild.member(event.user).roles.cache.has(`426789294007517205`)) return;
            event.guild.member(event.user).roles.add(`426789294007517205`);

            let loggingWelcomeBotEmbed = new discord.MessageEmbed()
                .setColor(resources.blue)
                .setTimestamp()
                .addField(`📑 Auditoría`, `El **BOT** @${event.user.username} fue añadido al servidor ↙`);
            loggingChannel.send(loggingWelcomeBotEmbed)
            return;
        }
    } catch (e) {

        if (e.toLocaleString().includes('Cannot send messages to this user')) return;

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
            .addField(`Error:`, `\`\`\`${error}\`\`\``)
            .setFooter(new Date().toLocaleString(), resources.server.iconURL()).setTimestamp();
        
        //Se envía el mensaje al canal de depuración
        await client.channels.cache.get(config.debuggingChannel).send(debuggEmbed);
    }
}
