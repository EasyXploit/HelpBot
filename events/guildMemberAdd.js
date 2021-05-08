exports.run = async (event, discord, fs, config, keys, client, resources) => {
    
    try {
        //Previene que continue la ejecución si el servidor no es la República Gamer
        if (event.guild.id !== client.homeGuild.id) return;

        const loggingChannel = client.channels.cache.get(config.loggingChannel);
        const welcomeChannel = client.channels.cache.get(config.welcomeChannel);

        if (!event.user.bot) {
            const prohibitedNames = [`http://`, `https://`, `discord.gg`, `www.`, `.tv`, `twitch.tv`, `.net`, `.com`, `twitter.com`, `paypal.me`, `.me`, `donate.`, `.gg`, `binzy`];

            if(prohibitedNames.some(word => event.user.username.toLowerCase().includes(word))) {

                let toDMEmbed = new discord.MessageEmbed()
                    .setColor(resources.red2)
                    .setAuthor('[EXPULSADO]', event.guild.iconURL())
                    .setDescription(`<@${event.user.id}>, has sido expulsado de ${event.guild.name}`)
                    .addField('Moderador', client.user, true)
                    .addField('Razón', 'No está permitido utilizar enlaces como nombre de usuario.', true)

                await event.user.send(toDMEmbed);
                await event.kick(event.user, {reason: `Moderador: ${client.user.id}, Razón: No está permitido utilizar enlaces como nombre de usuario.`})

                .catch ((err) => {
                    console.error(`${new Date().toLocaleString()} 》${err}`);

                    let errorEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setTitle(`${resources.RedTick} Ocurrió un error`)
                        .setDescription(`Ocurrió un error durante la ejecución del evento "guildMemberAdd".\nEl usuario ${event.user.username} no fue expulsado automáticamente de la comunidad, por lo que será necesario emprender acciones de forma manual.`);
                    loggingChannel.send(errorEmbed);
                });
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

                //Añade el avatar del miembro
                const avatar = await Canvas.loadImage(event.user.displayAvatarURL({ format: 'jpg' }));
                ctx.drawImage(avatar, 25, 25, 200, 200);

                //Adjunta y envía la foto
                const attachment = new discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
                await welcomeChannel.send(attachment);

                /* --- --- */

                let loggingWelcomeEmbed = new discord.MessageEmbed()
                    .setColor(resources.green)
                    .setThumbnail(event.user.displayAvatarURL())
                    .setAuthor('Nuevo miembro', 'https://i.imgur.com/A60x2Di.png')
                    .setDescription(`${event.user.username} se unió al servidor`)
                    .addField('🏷 TAG completo', event.user.tag, true)
                    .addField('🆔 ID del miembro', event.user.id, true);

                let dmWelcomeEmbed = new discord.MessageEmbed()
                    .setColor(resources.gold)
                    .setAuthor('REPÚBLICA GAMER', client.homeGuild.iconURL())
                    .setImage('https://i.imgur.com/IeExpLO.png')
                    .setTitle(`Hola **${event.user.username}**, bienvenido a la __República Gamer__ :tada:`)
                    .setDescription('**¡Nos alegra que hayas decidido unirte a nuestra comunidad!**\nA continuación, te mostramos una breve guía sobre como empezar a participar en nuestro servidor. __¡Esperamos que lo pases bien!__')
                    .addField('Guía de inicio rápido:', `:one: Entra en <#498455357853794304> y dedica unos segundos a leer las breves normas que rigen nuestra comunidad. Además, aprenderás a usar a los bots, a como obtener ayuda y a como subir de nivel.\n:two: Entra en \`⚡ | Crear sala\` para crear ¡tu propia sala temporal! (recuerda que desparecerá si no hay nadie en ella).\n:three: ¡Tan solo diviértete y trae a tus amigos para que nos conozcan! Mándales este enlace de invitación:${config.serverInvite}`, true);

                //await welcomeChannel.send(channelWelcomeEmbed);
                await loggingChannel.send(loggingWelcomeEmbed);
                await event.user.send(dmWelcomeEmbed);
                
            }
        } else {
            if (event.guild.member(event.user).roles.cache.has('426789294007517205')) return;
            event.guild.member(event.user).roles.add('426789294007517205');

            let loggingWelcomeBotEmbed = new discord.MessageEmbed()
                .setColor(resources.blue)
                .setTitle('📑 Auditoría - [BOTS]')
                .setDescription(`El **BOT** @${event.user.tag} fue añadido al servidor.`);
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
            .setTitle('📋 Depuración')
            .setDescription('Se declaró un error durante la ejecución de un evento')
            .addField('Evento:', 'guildMemberAdd', true)
            .addField('Fecha:', new Date().toLocaleString(), true)
            .addField('Error:', `\`\`\`${error}\`\`\``);
        
        //Se envía el mensaje al canal de depuración
        await client.channels.cache.get(config.debuggingChannel).send(debuggEmbed);
    }
}
