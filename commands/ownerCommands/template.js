exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //$template (plantilla)
    
    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(resources.RedTick + ' La sintaxis de este comando es `' + config.ownerPrefix + 'template (plantilla)`');

        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);

        if (args[0] === `informacion`) {
            message.delete();
            
            let embed1 = new discord.RichEmbed()
                .setColor(resources.gold)
                .setDescription(`${resources.republicagamer} **Bienvenido al servidor oficial de la República Gamer en Discord**\nA continuación te explicaremos la dinámica de este servidor:`)
                .attachFile(`./resources/images/banners/logo_banner_transparent.png`);
            
            let embed2 = new discord.RichEmbed()
                .setColor(resources.gold)
                .setAuthor(`REGLAMENTO DE LA COMUNIDAD`, `https://i.imgur.com/jAiDAvR.png`)
                .setDescription(`Este servidor se apoya en los **Términos de Servicio** y las **Directivas de la comunidad de Discord**. Puedes encontrarlos en __https://discordapp.com/terms__ y en __https://discordapp.com/guidelines__ respectivamente.`)
                .addField(`:one: No está permitido publicar contenido inadecuado:`, `Es decir, todo lo relacionado con pornografía, drogas y apuestas. Tampoco contenido que pueda alentar el odio hacia una etnia, religión o cualquier otro colectivo/individuo. De la misma forma están prohibidas las actitudes tóxicas, faltas de respeto, el acoso, el gore y/o crueldad animal y el envío de pornografía infantil.`, true)
                .addField(`:two: Está prohibido hacer spam:`, `No puedes enviar links hacia otros servidores de Discord _(tanto invitaciones como URL redireccionadas o spam relacionado)_, ni links de afiliado ni spamear (incluyendo mensajes directos). Tampoco puedes abusar de las menciones a los demás usuarios y también está prohibido hacer _flood_ de chat. __Si deseas que te promocionemos, contáctanos.__`, true)
                .addField(`:three: No abuses de las menciones:`, 'No está permitido excederse utilizando las menciones a personas, a __roles__, o a `@everyone` y `@here`. _Las menciones abusivas pueden ser realmente molestas y pueden llevar a los usuario a silenciar el servidor._', true)
                .addField(`:four: Respeta las temáticas:`, `Has de usar los canales de texto/voz adecuados en cada caso. Lee los temas de los canales para más información.`, true)
                .addField(`:five: No busques vacíos legales:`, `No intentes hacer algo que obviamente pueda resultar inadecuado tanto para el staff como para el resto de usuarios de la comunidad.` + '\n\n```La infracción de la normativa conllevará desde sanciones administrativas (warn, mute, ban o kick) hasta avisos a las autoridades (en el caso de actividades ilegales).```', true)
                .attachFile(`./resources/images/banners/rules.png`);
            
            let embed3 = new discord.RichEmbed()
                .setColor(resources.gold)
                .setDescription(':grey_question: Escribe `!ayuda` en cualquier canal de texto para acceder al sistema de ayuda.\n\n📓 Escribe `!normas` para mostrar las normas del servidor.\n\n' + resources.pilkobot + ' Escribe `!pilko` para mostrar los comandos de <@446041159853408257>.\n\n:robot: Escribe `!comandos` para mostrar los comandos de los bots.\n\n:military_medal: Escribe `!rangos` para mostrar los rangos, la tabla de puntuaciones y tu nivel.')
                .attachFile(`./resources/images/banners/help.png`);
            
            let embed4 = new discord.RichEmbed()
                .setColor(resources.gold)
                .setThumbnail(`https://i.imgur.com/vDgiPwT.png`)
                .setAuthor(`NIVELES`, `https://i.imgur.com/vDgiPwT.png`)
                .setDescription(`Los usuarios que participan __activamente__ en la comunidad adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:`)
                .addField(`${resources.chevron} Nivel 0 ‣ PLATA I`, `Es el primer rol que recibes al unirte a la comunidad.`, true)
                .addField(`${resources.chevron5} Nivel 5 ‣ PLATA V`, `Permite usar emojis externos${resources.nitro} y acceder a sorteos públicos.`, true)
                .addField(`${resources.chevron15} Nivel 10 ‣ ORO V`, `Permite **adjuntar archivos** y **cambiar tu propio apodo**.`, true)
                .addField(`${resources.chevron18} Nivel 15 ‣ PLATINO V`, `Te permite **mencionar a todos** y **controlar la música**.`, true)
                .addField(`● Estadísticas`, 'Usa `!rank` para conocer tu nivel\n[Ver la tabla de clasificación](https://mee6.xyz/leaderboard/374945492133740544)')
                .attachFile(`./resources/images/banners/ranks.png`);

            let embed5 = new discord.RichEmbed()
                .setColor(resources.gold)
                .setThumbnail(`https://i.imgur.com/TU8U8wq.png`)
                .setAuthor(`ROLES ASIGNABLES`, `https://i.imgur.com/TU8U8wq.png`)
                .addField(`● ¿Que son?`, `Los roles asignables te permiten añadir __tus propios roles__ basados en tus **intereses**, **videojuegos** y **región**.`, true)
                .addField(`● ¿Como los uso?`, `Desde el canal <#440905255073349635>, puedes reaccionar al mensaje de configuración con los emojis correspondientes a los roles que quieres asignarte`, true);
            
            let embed6 = new discord.RichEmbed()
                .setColor(resources.gold)
                .setThumbnail(`https://i.imgur.com/0l3jSuV.png`)
                .setAuthor(`RANGO SUPPORTER`, `https://i.imgur.com/0l3jSuV.png`)
                .setDescription(`Aquellos usuarios que traen a __gente nueva__ a la comunidad son recompensados con el rango **@SUPPORTER**, que permite acceder a varias ventajas, entre las que destacan el **acceso preferente a los sorteos**, poder **cambiar su propio apodo** y usar **emojis externos**.`)
                .addField(`🞘 Pasos a seguir:`, `:one: Genera una invitación instantánea. [Ver cómo](https://support.discordapp.com/hc/es/articles/208866998-Invitaci%C3%B3n-Instant%C3%A1nea-101)\n:two: Invita a 5 personas _(procura que se unan y se queden)_.\n:three: ¡Recibirás tu rol cuando se unan 5! _(lo perderás si se van)_.`, true)
                .addField(`🞘 Comandos:`, 'Usa `+invites` para conocer a cuantos has invitado.\nUsa `+leaderboard` para ver la tabla de clasificacion.', true);
            
            let donateEmbed = new discord.RichEmbed()
                .setColor(resources.gold)
                .setThumbnail(`https://image.ibb.co/cxhbXf/diamond.png`)
                .setAuthor(`¡APÓYANOS!`, `https://i.imgur.com/6lpSOKA.png`)
                .setDescription(`¡La comunidad necesita de tu ayuda para crecer!. Realizando un donativo ayudas a financiar el desarrollo y manutención de <@446041159853408257>, cuyo servidor requiere de una inversión mensual para mantenerse funcionando.\n\nAl donar, también permites que el <@&428631949029015562> que se esfuerza en la comunidad, reciba compensación por su esfuerzo.`)
                .addField(`🏆 ¿Que consigues?`, `● Un rango por encima de los que se obtienen mediante XP.\n● Acceder a salas de voz VIP, con un mejor Bitrate.\n● Un chat de texto exclusivo para VIPs (con mensajes de TTS).\n● Controlar a los bots de música.\n● Acceder a todos los sorteos públicos.\n● Cambiar tu propio apodo cuando quieras.\n● Adjuntar cualquier tipo archivo.\n● Mencionar a todos (` + '`@everyone y @here`' + `).\n● Usar emojis de otros servidores (si eres usuario de Nitro).`, true)
                .addField(`💎 Apoyar`, `[Haz clic aquí y sigue las instrucciones en pantalla](https://www.patreon.com/republicagamer)`, true)

            let embed7 = new discord.RichEmbed()
                .setColor(resources.gold)
                .setAuthor(`ENLACE DE INVITACIÓN PERMANENTE`, `https://i.imgur.com/teglfDA.png`)
                .setThumbnail(`https://i.imgur.com/teglfDA.png`)
                .setDescription(`➧ Puedes usar el siguiente enlace para invitar a más jugadores a la comunidad. **¡Compártelo con todos!**\n_(este link no cuenta para tus invitaciones a referidos)_`)
                .attachFile(`./resources/images/banners/link.png`);
            
            await message.channel.send(embed1);
            await message.channel.send(embed2);
            await message.channel.send(embed3);
            await message.channel.send(embed4);
            await message.channel.send(embed5);
            await message.channel.send(embed6);
            await message.channel.send(donateEmbed);
            await message.channel.send(embed7);
            await message.channel.send(`https://discord.gg/nYdyN2k`);
            
        } else if (args[0] === `roles`) {
            message.delete();
        
            let csgo = message.guild.roles.find(r => r.name === `CS:GO`);
            let r6 = message.guild.roles.find(r => r.name === `RAINBOW SIX`);
            let fortnite = message.guild.roles.find(r => r.name === `FORTNITE`);
            let rocketleague = message.guild.roles.find(r => r.name === `ROCKET LEAGUE`);
            let lol = message.guild.roles.find(r => r.name === `LOL`);
            let minecraft = message.guild.roles.find(r => r.name === `MINECRAFT`);
            let battlefield = message.guild.roles.find(r => r.name === `BATTLEFIELD`);
            let pubg = message.guild.roles.find(r => r.name === `PUBG`);
            let gtav = message.guild.roles.find(r => r.name === `GTA V`);
            let roblox = message.guild.roles.find(r => r.name === `ROBLOX`);
            let overwatch = message.guild.roles.find(r => r.name === `OVERWATCH`);

            let rolesEmbed = new discord.RichEmbed()
                .setColor(resources.gray)
                .setThumbnail(`https://i.imgur.com/TU8U8wq.png`)
                .setAuthor(`ELIGE TUS ROLES`, `https://i.imgur.com/TU8U8wq.png`)
                .setDescription(`Reacciona con el emoji correspondiente al rol que quieras asignarte. En cualquier momento puedes quitarte un rol retirando tu reacción.`)
                .addField(`Región`, '● Reacciona con :flag_es: para asignarte el rol `@ES`\n● Reacciona con :earth_americas: para asignarte el rol `@LATAM`', true)
                .addField(`Videojuegos`, '● Reacciona con :bomb: para asignarte el rol `@CS:GO`\n● Reacciona con :boom: para asignarte el rol `@RAINBOW SIX`\n● Reacciona con :hammer_pick: para asignarte el rol `@FORTNITE`\n● Reacciona con 🚀 para asignarte el rol `@ROCKET LEAGUE`\n● Reacciona con 🌟 para asignarte el rol `@LOL`\n● Reacciona con ⛏ para asignarte el rol `@MINECRAFT`\n● Reacciona con ⚜ para asignarte el rol `@BATTLEFIELD`\n● Reacciona con 🔫 para asignarte el rol `@PUBG`\n● Reacciona con 🚔 para asignarte el rol `@GTA V`\n● Reacciona con 📦 para asignarte el rol `@ROBLOX`\n● Reacciona con ⚡ para asignarte el rol `@OVERWATCH`\n\n_Si hay algún rol que no está en la lista y te gustaría que añadiésemos, envíanos un mensaje a <#449289541866749953>_', true)
                .setFooter(`© 2018 República Gamer LLC`, resources.server.iconURL);
            message.channel.send(rolesEmbed).then(async function (message) {
                await message.react(`🇪🇸`);
                await message.react(`🌎`);
                await message.react(`💣`);
                await message.react(`💥`);
                await message.react(`⚒`);
                await message.react(`🚀`);
                await message.react(`🌟`);
                await message.react(`⛏`);
                await message.react(`⚜`);
                await message.react(`🔫`);
                await message.react(`🚔`);
                await message.react(`📦`);
                await message.react(`⚡`);
            });
        } else if (args[0] === `sorteo`) {
            message.delete();

            let giveawayEmbed = new discord.RichEmbed()
                .setColor(resources.gold)
                .setTitle(`:tada: SORTEO DE UN VIDEOJUEGO A ELEGIR·`)
                .setDescription(`Hemos organizado un nuevo sorteo para todos aquellos que compartan la comunidad con sus amigos, para que de esta forma nos conozca cada vez más gente.\n\nEn esta ocasión sorteamos **Un videojuego a elegir**`)
                .setThumbnail(`https://i.imgur.com/YUOdN5X.png`)

            let basesEmbed = new discord.RichEmbed()
                .setColor(resources.gold)
                .setTitle(`Bases del sorteo`)
                .setDescription(`El sorteo comienza el día **1** de **ENERO** y finalizará el día **14** de **ENERO** de 2019\n\nSolo aquellos jugadores que hayan invitado a otras __5 personas__ a través de un __enlace de invitación personalizado__ _(y se hayan unido al servidor)_, podrán participar en el sorteo.\n\nUna vez se hayan unido 5 personas con tu invitación, recibirás en rango <@&447475457617821698>, el cual te permite acceder al canal del sorteo.\n\nEste sorteo tendrá una duración máxima de **14 días** desde la fecha de publicación del evento _(podrá ser finalizado prematuramente)_.\n\n**De resultar ganador, podrás elegir entre:**\n\n➢ Player Unknowns Battlegrounds  _(Steam)_\n➢ Grand Theft Auto V  _(Social Club)_\n➢ Counter Strike: Global Offensive  _(Steam)_\n➢ Rainbow Six Siege  _(Uplay)_\n➢ Rocket League  _(Steam)_\n➢ Ghost Recon Wildlands  _(Uplay)_\n➢ Los Sims 4  _(Origin)_\n➢ Battlefield 1  _(Origin)_\n➢ Dark Souls 3  _(Steam)_\n➢ DOOM  _(Steam)_\n➢ Watch Dogs 2  _(Uplay)_\n➢ The Witcher 3: Wild Hunt GOTY Edition  _(GOG Galaxy)_\n➢ Far Cry 4  _(Uplay)_\n➢ Minecraft  _(Mojang)_\n➢ The Elder Scrolls V: Skyrim Special Edition  _(Steam)_\n➢ Arma III  _(Steam)_\n➢ Civilization V: Complete Edition  _(Steam)_\n➢ Killing Floor 2  _(Steam)_\n➢ Titanfall 2  _(Origin)_\n➢ Age of Empires: Definitive Edition  _(Microsoft Store)_\n➢ Just Cause 3  _(Steam)_\n➢ Plants vs. Zombies: Garden Warfare 2  _(Origin)_`)
                .setThumbnail(`https://i.imgur.com/qfamqUv.png`)

            let entryEmbed = new discord.RichEmbed()
                .setColor(resources.gold)
                .setTitle(`Entrada al sorteo`)
                .setDescription(`Participa en el sorteo desde: <#529383165551181824>.\n(solo verás el canal cuando obtengas el rango <@&447475457617821698>).`)
                .setThumbnail(`https://i.imgur.com/jRVtTSF.png`)

            await message.channel.send(giveawayEmbed);
            await message.channel.send(basesEmbed);
            await message.channel.send(entryEmbed);
        } else if (args[0] === `marafu`) {
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
        } else if (args[0] === `detuned`) {
            message.delete();
            
            let embed = new discord.RichEmbed()
                .setColor(resources.gold) .setThumbnail(`https://vignette.wikia.nocookie.net/clubpenguin/images/0/0a/Pumpkin_Head_clothing_icon_ID_1095.png/revision/latest?cb=20131006145935`)
                .setAuthor(`[DETUNED] EVENTO DE HALLOWEEN`, `https://cdn.discordapp.com/avatars/147813177004916736/96c24cbea86c4f1fe654b34693eda5c9.png?`)
                .setDescription('**¡Hola a todos!** Me gustaría compartiros por aquí un __evento especial por Halloween__ que van a hacer hoy en Detuned, 31 de Octubre. No sólo van a jugar a un juego de terror con cámara, sino que también van a sortear un juego y estrenarán una nueva sección muy especial llamada **Desafina tu Destino**.\n\n:yellow_heart: _¡Muchas gracias a todos los que os podáis pasar por el directo!_ Ya sea porque os quedéis viéndolos y participando, como con el directo abierto en segundo plano. ¡Valoran mucho vuestro apoyo.')
                .addField(`:link: Detalles`, `[Haz clic aquí para más info.](https://medium.com/tuneintodetuned/especial-halloween-f7c4ed23487d)`, true)
                .addField(`👮 Responsable de organización`, `<@147813177004916736>`, true)
                .setImage(`https://image.ibb.co/kqte50/1-OOk0l-HSi-Ns-EZs-XNv-Rm9-HSQ.jpg`)
                .setFooter(`República Gamer no se responsabiliza de la organización del evento`, resources.server.iconURL);
            
            message.channel.send(embed);
        } else if (args[0] === `bienvenida`) {
            let noUserEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No has proporcionado un usuario válido`);
            
            let noBotsEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No puedes entablar una conversación con un bot`);
            
            let successEmbed = new discord.RichEmbed()
                .setColor(resources.green)
                .setDescription(`${resources.GreenTick} ¡Listo!`);
            
            if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);
            
            let member = await message.guild.fetchMember(message.mentions.users.first() || bot.fetchUser(args[1]));
            if (!member) return message.channel.send(noUserEmbed);
            if (member.user.bot) return message.channel.send(noBotsEmbed);
            
            await message.delete().then(bot.emit(`guildMemberAdd`, member));
            await message.channel.send(successEmbed).then(msg => {msg.delete(1000)});
        } else if (args[0] === `donar`) {
            message.delete();
            
            let donateEmbed = new discord.RichEmbed()
                .setColor(0x00D2D7)
                .setThumbnail(`https://image.ibb.co/cxhbXf/diamond.png`)
                .setAuthor(`¡APÓYANOS!`, `https://i.imgur.com/6lpSOKA.png`)
                .setDescription(`¡La comunidad necesita de tu ayuda para crecer!. Realizando un donativo ayudas a financiar el desarrollo y manutención de <@446041159853408257>, cuyo servidor requiere de una inversión mensual para mantenerse funcionando.\n\nAl donar, también permites que el <@&428631949029015562> que se esfuerza en la comunidad, reciba compensación por su esfuerzo.`)
                .addField(`🏆 ¿Que consigues?`, `● Un rango por encima de los que se obtienen mediante XP.\n● Acceder a salas de voz VIP, con un mejor Bitrate.\n● Un chat de texto exclusivo para VIPs (con mensajes de TTS).\n● Controlar a los bots de música.\n● Acceder a todos los sorteos públicos.\n● Cambiar tu propio apodo cuando quieras.\n● Adjuntar cualquier tipo archivo.\n● Mencionar a todos (` + '`@everyone y @here`' + `).\n● Usar emojis de otros servidores (si eres usuario de Nitro).`, true)
                .addField(`💎 Apoyar`, `[Haz clic aquí y sigue las instrucciones en pantalla](https://www.patreon.com/republicagamer)`, true)
                .attachFile(`./resources/images/banners/support.png`);
            
            message.channel.send(donateEmbed);
        } else if (args[0] === `roles1`) {
            message.delete();

            const europe = await bot.emojis.get('538773808673325075');
            const latam = await bot.emojis.get('538773808773857291');
            
            let channel = message.guild.channels.find( c => c.id === `440905255073349635`);
            let msg = await channel.fetchMessage(`538869679234744330`);
            
            let embed = new discord.RichEmbed()
                .setColor(resources.gray)
                .setAuthor(`ELIGE TUS ROLES`, `https://i.imgur.com/TU8U8wq.png`)
                .setThumbnail(`https://i.imgur.com/TU8U8wq.png`)
                .setDescription(`Reacciona con el emoji correspondiente al rol que quieras asignarte. En cualquier momento puedes quitarte un rol retirando tu reacción.`)
                .addField(`Región`, '● Reacciona con ' + europe + ' para asignarte el rol `@EUROPA`\n● Reacciona con ' + latam + ' para asignarte el rol `@LATINOAMÉRICA`', true)
                .addField(`Configuraciones`, '● Reacciona con :newspaper: para asignarte recibir actualizaciones de los videojuegos que te asignes en la sección de "Videojuegos"', true)
            
            msg.edit(newEmbed);
        } else if (args[0] === `roles2`) {
            message.delete();

            const r6 = await bot.emojis.get('538773808648028190');
            const csgo = await bot.emojis.get('538865510432112670');
            const fortnite = await bot.emojis.get('538774033634820117');
            const lol = await bot.emojis.get('538773808891559949');
            const apex = await bot.emojis.get('543093735836221462');
            
            let channel = message.guild.channels.find( c => c.id === `440905255073349635`);
            let msg = await channel.fetchMessage(`538869690626342924`);
            
            let embed = new discord.RichEmbed()
                .setColor(resources.gray)
                .setThumbnail(`https://i.imgur.com/Nz65AFB.png`)
                .addField(`Videojuegos principales`, '● Reacciona con ' + r6 + ' para asignarte el rol `@RAINBOW SIX`\n● Reacciona con ' + csgo + ' para asignarte el rol `@CS:GO`\n● Reacciona con ' + fortnite + ' para asignarte el rol `@FORTNITE`\n● Reacciona con ' + lol + ' para asignarte el rol `@LOL`\n● Reacciona con ' + apex + ' para asignarte el rol `@APEX LEGENDS`', true)
            
            msg.edit(embed);
        } else if (args[0] === `roles3`) {
            message.delete();
            
            let channel = message.guild.channels.find( c => c.id === `440905255073349635`);
            let msg = await channel.fetchMessage(`538869701141331999`);
            
            let embed = new discord.RichEmbed()
                .setColor(resources.gray)
                .setThumbnail(`https://i.imgur.com/WdWMdgt.png`)
                .addField(`Otros videojuegos`, '● Reacciona con 🔫 para asignarte el rol `@PUBG`\n● Reacciona con 🚀 para asignarte el rol `@ROCKET LEAGUE`\n● Reacciona con ⛏ para asignarte el rol `@MINECRAFT`\n● Reacciona con ⚜ para asignarte el rol `@BATTLEFIELD`\n● Reacciona con 🚔 para asignarte el rol `@GTA V`\n● Reacciona con 📦 para asignarte el rol `@ROBLOX`\n● Reacciona con ⚡ para asignarte el rol `@OVERWATCH`\n● Reacciona con 🛫 para asignarte el rol `@BO4`\n● Reacciona con 🌲 para asignarte el rol `@TERRARIA`\n● Reacciona con 🏡 para asignarte el rol `@STARDEW VALLEY`\n● Reacciona con 🗡 para asignarte el rol `@BRAWLHALLA`\n● Reacciona con 🐲 para asignarte el rol `@ARK`\n● Reacciona con 💎 para asignarte el rol `@PAYDAY`', true)
                .setFooter(`© 2018 República Gamer LLC`, resources.server.iconURL);
            
            msg.edit(embed);
        } else if (args[0] === `oposiciones`) {
            message.delete();
            
            let embed = new discord.RichEmbed()
                .setColor(resources.blue)
                .setThumbnail(`https://i.imgur.com/WFyNbtO.png`)
                .setAuthor(`Presenta tu oposición a moderador (LATAM)`, resources.server.iconURL)
                .setDescription(`Estamos buscando personas de **LATAM** comprometidas con la comunidad interesadas en "echarnos un cable" moderando el servidor. Necesitamos gente proactiva, seria (pero no demasiado), con experiencia en el uso de Discord ¡y con ganas de ayudar!`)
                .addField(`Si estás interesado, envía la siguiente información vía MD a @EasyXploit:`, `● ¿Como te llamas (nombre y apellidos)?\n● ¿Cual es tu edad?\n● ¿Cual es tu país de residencia?\n● ¿Tienes experiencia moderando?\n● ¿Administras algún otro servidor de Discord?\n● ¿Por que quieres ser moderador?\n\n● Las oposiciones finalizan el día 29 de Octubre de 2018. Tan solo tienes que enviar la información requerida a <@359333470771740683> y este revisará tu oposición y se pondrá en contacto contigo.`, true)
                .attachFile(`./resources/images/banners/oppositions.png`);
            
            message.channel.send(embed);
        } else {
            let noArgsEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No has especificado una plantilla válida`);
            message.channel.send(noArgsEmbed);
        }
    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
