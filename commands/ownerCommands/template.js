exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //$template (plantilla)
    
    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(resources.RedTick + ' La sintaxis de este comando es `' + config.ownerPrefix + 'template (plantilla)`');

        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);

        if (args[0] === 'informacion') {
            message.delete();
            
            let embed1 = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setDescription(resources.republicagamer + ' **Bienvenido al servidor oficial de la República Gamer en Discord**\nA continuación te explicaremos la dinámica de este servidor:')
                .attachFile('./resources/images/banners/logo_banner_transparent.png');
            
            let embed2 = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setAuthor('REGLAMENTO DE LA COMUNIDAD', 'https://i.imgur.com/jAiDAvR.png')
                .setDescription('Este servidor se apoya en los **Términos de Servicio** y las **Directivas de la comunidad de Discord**. Puedes encontrarlos en __https://discordapp.com/terms__ y en __https://discordapp.com/guidelines__ respectivamente.')
                .addField(':one: No está permitido publicar contenido inadecuado:', 'Es decir, todo lo relacionado con pornografía (excepto en <#505448278381428764>), drogas y apuestas. Tampoco contenido que pueda alentar el odio hacia una etnia, religión o cualquier otro colectivo/individuo. De la misma forma están prohibidas las actitudes tóxicas, faltas de respeto, el acoso, el gore y/o crueldad animal y el envío de pornografía infantil.', true)
                .addField(':two: Está prohibido hacer spam:', 'No puedes enviar links hacia otros servidores de Discord _(tanto invitaciones como URL redireccionadas o spam relacionado)_, ni links de afiliado (incluyendo mensajes directos). Tampoco puedes abusar de las menciones a los demás usuarios y también está prohibido hacer _flood_ de chat. __Si deseas que te promocionemos, contáctanos.__', true)
                .addField(':three: No abuses de las menciones:', 'No está permitido excederse utilizando las menciones a personas, a __roles__, o a `@everyone` y `@here`. _Las menciones abusivas pueden ser realmente molestas y pueden llevar a los usuario a silenciar el servidor._', true)
                .addField(':four: Respeta las temáticas:', 'Has de usar los canales de texto/voz adecuados en cada caso. Lee los temas de los canales para más información.', true)
                .addField(':five: No busques vacíos legales:', 'No intentes hacer algo que obviamente pueda resultar inadecuado tanto para el staff como para el resto de usuarios de la comunidad.\n\n```La infracción de la normativa conllevará desde sanciones administrativas (warn, mute, ban o kick) hasta avisos a las autoridades (en el caso de actividades ilegales).```', true)
                .attachFile('./resources/images/banners/rules.png');
            
            let embed3 = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setDescription(':grey_question: Escribe `!ayuda` en cualquier canal de texto para acceder al sistema de ayuda.\n\n📓 Escribe `!normas` para mostrar las normas del servidor.\n\n' + resources.pilkobot + ' Escribe `!pilko` para mostrar los comandos de <@446041159853408257>.\n\n:robot: Escribe `!comandos` para mostrar los comandos de los bots.\n\n:military_medal: Escribe `!rangos` para mostrar los rangos, la tabla de puntuaciones y tu nivel.')
                .attachFile('./resources/images/banners/help.png');
            
            let embed4 = new discord.RichEmbed()
                .setColor(16762967)
                .setThumbnail('https://i.imgur.com/vDgiPwT.png')
                .setAuthor('NIVELES', 'https://i.imgur.com/vDgiPwT.png')
                .setDescription('Los usuarios que participan __activamente__ en la comunidad adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:')
                .addField(resources.chevron + ' Nivel 0 ‣ NOVATOS', 'Es el primer rol que recibes al unirte a la comunidad.', true)
                .addField(resources.chevron5 + ' Nivel 3 ‣ INICIADOS', 'Permite usar emojis externos' + resources.nitro + ' y acceder a sorteos públicos.', true)
                .addField(resources.chevron9 + ' Nivel 5 ‣ PROFESIONALES', 'Permite publicar en <#472491041602404362> y en <#488662764081119233>.', true)
                .addField(resources.chevron15 + ' Nivel 8 ‣ VETERANOS', 'Permite **adjuntar archivos** y **cambiar tu propio apodo**.', true)
                .addField(resources.chevron18 + ' Nivel 10 ‣ EXPERTOS', 'Te permite **mencionar a todos** y **controlar la música**.', true)
                .addField('● Estadísticas', 'Usa `!rank` para conocer tu nivel\n[Ver la tabla de clasificación](https://mee6.xyz/leaderboard/374945492133740544)')
                .attachFile('./resources/images/banners/ranks.png');

            let embed5 = new discord.RichEmbed()
                .setColor(16762967)
                .setThumbnail('https://i.imgur.com/TU8U8wq.png')
                .setAuthor('ROLES ASIGNABLES', 'https://i.imgur.com/TU8U8wq.png')
                .addField('● ¿Que son?', 'Los roles asignables te permiten añadir __tus propios roles__ basados en tus **intereses**, **videojuegos** y **región**.', true)
                .addField('● ¿Como los uso?', 'Desde el canal <#440905255073349635>, puedes reaccionar al mensaje de configuración con los emojis correspondientes a los roles que quieres asignarte', true);
            
            let embed6 = new discord.RichEmbed()
                .setColor(16762967)
                .setThumbnail('https://i.imgur.com/0l3jSuV.png')
                .setAuthor('RANGO SUPPORTER', 'https://i.imgur.com/0l3jSuV.png')
                .setDescription('Aquellos usuarios que traen a __gente nueva__ a la comunidad son recompensados con el rango **@SUPPORTER**, que permite acceder a varias ventajas, entre las que destacan el **acceso preferente a los sorteos**, poder **cambiar su propio apodo** y usar **emojis externos**.')
                .addField('🞘 Pasos a seguir:', ':one: Genera una invitación instantánea. [Ver cómo](https://support.discordapp.com/hc/es/articles/208866998-Invitaci%C3%B3n-Instant%C3%A1nea-101)\n:two: Invita a 5 personas _(procura que se unan y se queden)_.\n:three: ¡Recibirás tu rol cuando se unan 5! _(lo perderás si se van)_.', true)
                .addField('🞘 Comandos:', 'Usa `+invites` para conocer a cuantos has invitado.\nUsa `+leaderboard` para ver la tabla de clasificacion.', true);
            
            let embed7 = new discord.RichEmbed()
                .setColor(16762967)
                .setAuthor('ENLACE DE INVITACIÓN PERMANENTE', 'https://i.imgur.com/teglfDA.png')
                .setThumbnail('https://i.imgur.com/teglfDA.png')
                .setDescription('➧ Puedes usar el siguiente enlace para invitar a más jugadores a la comunidad. **¡Compártelo con todos!**\n_(este link no cuenta para tus invitaciones a referidos)_')
                .attachFile('./resources/images/banners/link.png');
            
            await message.channel.send(embed1);
            await message.channel.send(embed2);
            await message.channel.send(embed3);
            await message.channel.send(embed4);
            await message.channel.send(embed5);
            await message.channel.send(embed6);
            await message.channel.send(embed7);
            await message.channel.send('https://discord.gg/eWx72Jy');
            
        } else if (args[0] === 'roles') {
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
        } else if (args[0] === 'afiliados') {
            message.delete();

            let resultEmbed = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setTitle('Comunidades afiliadas')
                .setDescription('Aquí se muestra un listado con las comunidades que participan en el programa de afiliaciones de la comunidad.\n\nSi quieres participar en este programa, ponte en contacto con nosotros enviando un mensaje directo a <@359333470771740683>')
                .setThumbnail('https://i.imgur.com/Dj1xJqK.png');
            message.channel.send(resultEmbed);
        } else if (args[0] === 'sorteo') {
            message.delete();

            let giveawayEmbed = new discord.RichEmbed()
                .setColor(0xA3B3EE)
                .setTitle(':tada: SORTEO DE 1.000 PAVOS DE FORTNITE')
                .setDescription('Hemos organizado un nuevo sorteo para todos aquellos que compartan la comunidad con sus amigos, para que de esta forma nos conozca cada vez más gente.\n\nEn esta ocasión sorteamos **1.000 paVos de Fortnite**, que te permitirán adquirir el nuevo Pase de Temporada')
                .setThumbnail('https://i.imgur.com/dkKER4U.png')

            let basesEmbed = new discord.RichEmbed()
                .setColor(0xA3B3EE)
                .setTitle('Bases del sorteo')
                .setDescription('El sorteo comienza el día **25** de **Septiembre** y finalizará el día **02** de **Octubre** de 2018\n\nSolo aquellos jugadores que hayan invitado a otras __5 personas__ a través de un __enlace de invitación personalizado__ _(y se hayan unido al servidor)_, podrán participar en el sorteo.\n\nUna vez se hayan unido 5 personas con tu invitación, recibirás en rango <@&447475457617821698>, el cual te permite acceder al canal del sorteo.\n\nEste sorteo tendrá una duración máxima de **7 días** desde la fecha de publicación del evento _(podrá ser finalizado prematuramente)_.')
                .setThumbnail('https://i.imgur.com/qfamqUv.png')

            let adquireEmbed = new discord.RichEmbed()
                .setColor(0xA3B3EE)
                .setTitle('Adquisición del premio')
                .setDescription('El premio se podrá obtener de una de las siguientes dos formas:\n\n● `Proporcionándonos las credenciales de tu cuenta de Epic, nosotros accederemos a tu cuenta y añadiremos los 1000 paVos a tu cuenta.`\n\n● `Creando una cuenta nueva con los detalles que desees, le añadiremos el saldo y te facilitaremos sus credenciales.`\n\nEl ganador será quien elija el método de entrega del premio.')
                .setThumbnail('https://i.imgur.com/pRSeU8Q.png')

            let entryEmbed = new discord.RichEmbed()
                .setColor(0xA3B3EE)
                .setTitle('Entrada al sorteo')
                .setDescription('Participa en el sorteo desde: <#494042090850877440>.\n(solo verás el canal cuando obtengas el rango <@&447475457617821698>).')
                .setThumbnail('https://i.imgur.com/jRVtTSF.png')

            await message.channel.send(giveawayEmbed);
            await message.channel.send(basesEmbed);
            await message.channel.send(adquireEmbed);
            await message.channel.send(entryEmbed);
        } else if (args[0] === 'marafu') {
            message.delete();
            
            let embed = new discord.RichEmbed()
                .setColor(0xEB0BEC)
                .setThumbnail(`https://cdn.discordapp.com/avatars/486892252115763200/c6dcf124ddbc86108fcd51267e08f7d5.png`)
                .setAuthor(`[Torneo MaRaFú] LEAGUE OF LEGENDS`, `https://cdn.discordapp.com/avatars/486892252115763200/c6dcf124ddbc86108fcd51267e08f7d5.png`)
                .setDescription('Dentro de poco se realizará un evento organizado por la **MaRaFú Army**. Un torneo que será casteado y tendrá una gran recompensa.\n\n')
                .addField(`📅 Información`, `La semana del __5 de noviembre__ se organizara un torneo de LoL (League of Legends) totalmente **gratis** (en el servidor EUW), se realizará únicamente los fines de semana, la duración del mismo es indefinida, se harán directos para cada partido en el canal de twitch [marafu_army](https://www.twitch.tv/marafu_army) con 1-2 comentaristas siempre (eso hará que sea más dinámico haciendo más divertido cada uno de los partidos del torneo).`, true)
                .addField(`ℹ Organización`, `Serán enfrentamientos de __5 vs 5__ en la **Grieta del Invocador** por equipos previamente hechos, es decir, los equipos deberán ser hechos e inscritos en el formulario antes del día de la inauguración del torneo.`, true)
                .addField(`🏆 Premios`, `El torneo tendrá premios para los que se alcen con el primer y el segundo puesto en la clasificación. Estarán en juego **50€** en (RP) Riot Points: el primer equipo ganará **4830 Riot Points** y el segundo equipo ganará **3250 Riot Points**.`, true)
                .addField(`👥 Equipos`,`_¿A que esperas para formar un equipo?_ Si no encuentras compañeros con los que formar un equipo, en el Discord de la MaRaFú Army se ha creado un canal para buscar miembros.\nDurante las siguientes semanas informaremos la fecha máxima para inscribirse en el torneo.\n\nEn caso de no poder participar en el torneo, siempre puedes ver los directos casteados en twitch: [marafu_army](https://www.twitch.tv/marafu_army) (te pasarás un buen rato y unas risas que nunca faltan).`, true)
                .addField(`📝 Formulario de inscripción`, `[Haz clic aquí para inscribirte](https://docs.google.com/forms/d/1CYHAGngKAu_Ve1SiCqpxbJ0yIYlxh1nVI-jML9H2G_I)`)
                .addField(`👮 Responsable de organización`, `<@372484235707285505>`, true)
                .setImage(`https://i.imgur.com/E7mxrFm.png`)
                .setFooter(`República Gamer no se responsabiliza de la organización del torneo`, resources.server.iconURL);
            
            message.channel.send(embed);
        } else if (args[0] === 'bienvenida') {
            let noUserEmbed = new discord.RichEmbed()
                .setColor(0xF04647)
                .setDescription(resources.RedTick + ' No has proporcionado un usuario válido');
            
            let noBotsEmbed = new discord.RichEmbed()
                .setColor(0xF04647)
                .setDescription(resources.RedTick + ' No puedes entablar una conversación con un bot');
            
            let successEmbed = new discord.RichEmbed()
                .setColor(0xB8E986)
                .setDescription(resources.GreenTick + ' ¡Listo!');
            
            if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);
            
            let member = message.mentions.members.first() || message.guild.members.get(args[1]);
            if (!member) return message.channel.send(noUserEmbed);
            if (member.user.bot) return message.channel.send(noBotsEmbed);
            
            message.delete().then(bot.emit('guildMemberAdd', member));
        } else if (args[0] === `donar`) {
            message.delete();
            
            let donateEmbed = new discord.RichEmbed()
                .setColor(0x00D2D7)
                .setThumbnail(`https://i.imgur.com/E26Kl1A.png`)
                .setAuthor(`¡APÓYANOS!`, `https://i.imgur.com/6lpSOKA.png`)
                .setDescription(`¡La comunidad necesita de tu ayuda para crecer!. Realizando un donativo ayudas a financiar el desarrollo y manutención de <@446041159853408257>, cuyo servidor requiere de una inversión mensual para mantenerse funcionando.\n\nAl donar, también permites que el <@&428631949029015562> que se esfuerza en la comunidad, reciba compensación por su esfuerzo.`)
                .addField(`🏆 ¿Que consigues?`, `● Un rango por encima de los que se obtienen mediante XP.\n● Acceder a salas de voz VIP, con un mejor Bitrate.\n● Un chat de texto exclusivo para VIPs (con mensajes de TTS).\n● Controlar a los bots de música.\n● Acceder a todos los sorteos públicos.\n● Cambiar tu propio apodo cuando quieras.\n● Adjuntar cualquier tipo archivo.\n● Mencionar a todos (` + '`@everyone y @here`' + `).\n● Usar emojis de otros servidores (si eres usuario de Nitro).`, true)
                .addField(`💎 Apoyar`, `[Haz clic aquí y sigue las instrucciones en pantalla](https://donatebot.io/checkout/374945492133740544)`, true)
                .attachFile(`./resources/images/banners/support.png`);
            
            message.channel.send(donateEmbed);
        } else if (args[0] === `rolnuevo`) {
            message.delete();
            
            let channel = message.guild.channels.find( c => c.id === `440905255073349635`);
            let msg = await channel.fetchMessage(args[1]);
            
            let newEmbed = new discord.RichEmbed()
                .setColor(0xE2E5E7)
                .setAuthor('ELIGE TUS ROLES', 'https://i.imgur.com/TU8U8wq.png')
                .setFooter('© 2018 República Gamer LLC', resources.server.iconURL)
                .setThumbnail('https://i.imgur.com/TU8U8wq.png')
                .setDescription('Reacciona con el emoji correspondiente al rol que quieras asignarte. En cualquier momento puedes quitarte un rol retirando tu reacción.')
                .addField('Región', '● Reacciona con :flag_es: para asignarte el rol `@ES`\n● Reacciona con :earth_americas: para asignarte el rol `@LATAM`', true)
                .addField('Videojuegos', '● Reacciona con :bomb: para asignarte el rol `@CS:GO`\n● Reacciona con :boom: para asignarte el rol `@RAINBOW SIX`\n● Reacciona con :hammer_pick: para asignarte el rol `@FORTNITE`\n● Reacciona con 🚀 para asignarte el rol `@ROCKET LEAGUE`\n● Reacciona con 🌟 para asignarte el rol `@LOL`\n● Reacciona con ⛏ para asignarte el rol `@MINECRAFT`\n● Reacciona con ⚜ para asignarte el rol `@BATTLEFIELD`\n● Reacciona con 🔫 para asignarte el rol `@PUBG`\n● Reacciona con 🚔 para asignarte el rol `@GTA V`\n● Reacciona con 📦 para asignarte el rol `@ROBLOX`\n● Reacciona con ⚡ para asignarte el rol `@OVERWATCH`\n● Reacciona con 🛫 para asignarte el rol `@BO4`\n● Reacciona con 🌲 para asignarte el rol `@TERRARIA`\n● Reacciona con 🏡 para asignarte el rol `@STARDEW VALLEY`\n● Reacciona con 🗡 para asignarte el rol `@BRAWLHALLA`\n● Reacciona con 🐲 para asignarte el rol `@ARK`', true);
            
            msg.edit(newEmbed);
        } else if (args[0] === `oposiciones`) {
            message.delete();
            
            let embed = new discord.RichEmbed()
                .setColor(0x3F8CFC)
                .setThumbnail(`https://i.imgur.com/WFyNbtO.png`)
                .setAuthor(`Presenta tu oposición a moderador (LATAM)`, resources.server.iconURL)
                .setDescription(`Estamos buscando personas de **LATAM** comprometidas con la comunidad interesadas en "echarnos un cable" moderando el servidor. Necesitamos gente proactiva, seria (pero no demasiado), con experiencia en el uso de Discord ¡y con ganas de ayudar!`)
                .addField(`Si estás interesado, envía la siguiente información vía MD a @EasyXploit:`, `● ¿Como te llamas (nombre y apellidos)?\n● ¿Cual es tu edad?\n● ¿Cual es tu país de residencia?\n● ¿Tienes experiencia moderando?\n● ¿Administras algún otro servidor de Discord?\n● ¿Por que quieres ser moderador?\n\n● Las oposiciones finalizan el día 29 de Octubre de 2018. Tan solo tienes que enviar la información requerida a <@359333470771740683> y este revisará tu oposición y se pondrá en contacto contigo.`, true)
                .attachFile(`./resources/images/banners/oppositions.png`);
            
            message.channel.send(embed);
        } else if (args[0] === `roles2`) {
            message.delete();
            
            let embed = new discord.RichEmbed()
                .setColor(0xE2E5E7)
                .addField('Videojuegos', '● Reacciona con 👹 para asignarte el rol `@MHW`\n● Reacciona con ☠ para asignarte el rol `@L4D2`\n\n_Si hay algún rol que no está en la lista y te gustaría que añadiésemos, envíanos un mensaje a <#449289541866749953>_', true)
                .setFooter('© 2018 República Gamer LLC', resources.server.iconURL);
            
            message.channel.send(embed);
        } else {
            let noArgsEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(resources.RedTick + ' No has especificado una plantilla válida');
            message.channel.send(noArgsEmbed);
        }
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
