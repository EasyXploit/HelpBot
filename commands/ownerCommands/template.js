exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //$template (plantilla)
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.ownerPrefix}template (plantilla)\``);

        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);

        if (args[0] === `informacion`) {
            message.delete();

            const cfg = require('../../config.json');
            
            let embed1 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setDescription(`${resources.republicagamer} **Bienvenido al servidor oficial de la República Gamer en Discord**\nA continuación te explicaremos la dinámica de este servidor:`)
                .attachFiles(`./resources/images/banners/logo_banner_transparent.png`);
            
            let embed2 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setAuthor(`REGLAMENTO DE LA COMUNIDAD`, `https://i.imgur.com/jAiDAvR.png`)
                .setDescription(`Este servidor se apoya en los **Términos de Servicio** y las **Directivas de la comunidad de Discord**. Puedes encontrarlos en __https://discordapp.com/terms__ y en __https://discordapp.com/guidelines__ respectivamente.`)
                .addField(`:one: No está permitido publicar contenido inadecuado:`, `Es decir, todo lo relacionado con pornografía, drogas y apuestas. Tampoco contenido que pueda alentar el odio hacia una etnia, religión o cualquier otro colectivo/individuo. De la misma forma están prohibidas las actitudes tóxicas, faltas de respeto, el acoso, el gore y/o crueldad animal y el envío de pornografía infantil.`)
                .addField(`:two: Está prohibido hacer spam:`, `No puedes enviar links hacia otros servidores de Discord _(tanto invitaciones como URL redireccionadas o spam relacionado)_, ni links de afiliado ni spamear (incluyendo mensajes directos). Tampoco puedes abusar de las menciones a los demás usuarios y también está prohibido hacer _flood_ de chat. __Si deseas que te promocionemos, contáctanos.__`)
                .addField(`:three: No abuses de las menciones:`, 'No está permitido excederse utilizando las menciones a personas, a __roles__, o a `@everyone` y `@here`. _Las menciones abusivas pueden ser realmente molestas y pueden llevar a los usuario a silenciar el servidor._')
                .addField(`:four: Respeta las temáticas:`, `Has de usar los canales de texto/voz adecuados en cada caso. Lee los temas de los canales para más información.`)
                .addField(`:five: No busques vacíos legales:`, 'No intentes hacer algo que obviamente pueda resultar inadecuado tanto para el staff como para el resto de usuarios de la comunidad.\n\n```La infracción de la normativa conllevará desde sanciones administrativas (warn, mute, ban o kick) hasta avisos a las autoridades (en el caso de actividades ilegales).```')
                .attachFiles(`./resources/images/banners/rules.png`);
            
            let embed3 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setDescription(`:grey_question: Escribe \`!ayuda\` en cualquier canal de texto para acceder al sistema de ayuda.\n\n📓 Escribe \`!normas\` para mostrar las normas del servidor.\n\n${resources.pilkobot} Escribe \`!pilko\` para mostrar los comandos de <@446041159853408257>.\n\n:robot: Escribe \`!comandos\` para mostrar los comandos de los bots.\n\n:military_medal: Escribe \`!rangos\` para mostrar los rangos, la tabla de puntuaciones y tu nivel.`)
                .attachFiles(`./resources/images/banners/help.png`);
            
            let embed4 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail(`https://i.imgur.com/vDgiPwT.png`)
                .setAuthor(`NIVELES`, `https://i.imgur.com/vDgiPwT.png`)
                .setDescription(`Los usuarios que participan __activamente__ en la comunidad adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:`)
                .addField(`${resources.chevron} Nivel 0 ‣ PLATA I`, `Es el primer rol que recibes al unirte a la comunidad.`, true)
                .addField(`${resources.chevron5} Nivel 5 ‣ PLATA V`, `Permite usar emojis externos${resources.nitro} y acceder a sorteos públicos.`, true)
                .addField(`${resources.chevron15} Nivel 10 ‣ ORO V`, `Permite **adjuntar archivos** y **cambiar tu propio apodo**.`, true)
                .addField(`${resources.chevron18} Nivel 15 ‣ PLATINO V`, `Te permite **mencionar a todos** y **controlar la música**.`, true)
                .addField(`● Estadísticas`, 'Usa `!rank` para conocer tu nivel\nUsa `!leaderboard` para ver la tabla de clasificación')
                .attachFiles(`./resources/images/banners/ranks.png`);
            
            let embed5 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail(`https://i.imgur.com/0l3jSuV.png`)
                .setAuthor(`RANGO SUPPORTER`, `https://i.imgur.com/0l3jSuV.png`)
                .setDescription(`Aquellos usuarios que traen a __gente nueva__ a la comunidad son recompensados con el rango **@SUPPORTER**, que permite acceder a varias ventajas, entre las que destacan el **acceso preferente a los sorteos**, poder **cambiar su propio apodo** y usar **emojis externos**.`)
                .addField(`🞘 Pasos a seguir:`, `:one: Genera una invitación instantánea. [Ver cómo](https://support.discordapp.com/hc/es/articles/208866998-Invitaci%C3%B3n-Instant%C3%A1nea-101)\n:two: Invita a 5 personas _(procura que se unan y se queden)_.\n:three: ¡Recibirás tu rol cuando se unan 5! _(lo perderás si se van)_.`, true)
                .addField(`🞘 Comandos:`, 'Usa `+invites` para conocer a cuantos has invitado.\nUsa `+leaderboard` para ver la tabla de clasificacion.', true);

            let embed6 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setAuthor(`ENLACE DE INVITACIÓN PERMANENTE`, `https://i.imgur.com/teglfDA.png`)
                .setThumbnail(`https://i.imgur.com/teglfDA.png`)
                .setDescription(`➧ Puedes usar el siguiente enlace para invitar a más jugadores a la comunidad. **¡Compártelo con todos!**\n_(este link no cuenta para tus invitaciones a referidos)_`)
                .attachFiles(`./resources/images/banners/link.png`);
            
            await message.channel.send(embed1);
            await message.channel.send(embed2);
            await message.channel.send(embed3);
            await message.channel.send(embed4);
            await message.channel.send(embed5);
            await message.channel.send(embed6);
            await message.channel.send(cfg.serverInvite);
            
        } else if (args[0] === `sorteo`) {
            message.delete();

            let giveawayEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setTitle(`:tada: SORTEO DE UN VIDEOJUEGO A ELEGIR·`)
                .setDescription(`Hemos organizado un nuevo sorteo para todos aquellos que compartan la comunidad con sus amigos, para que de esta forma nos conozca cada vez más gente.\n\nEn esta ocasión sorteamos **Un videojuego a elegir**`)
                .setThumbnail(`https://i.imgur.com/YUOdN5X.png`)

            let basesEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setTitle(`Bases del sorteo`)
                .setDescription(`El sorteo comienza el día **1** de **ENERO** y finalizará el día **14** de **ENERO** de 2019\n\nSolo aquellos jugadores que hayan invitado a otras __5 personas__ a través de un __enlace de invitación personalizado__ _(y se hayan unido al servidor)_, podrán participar en el sorteo.\n\nUna vez se hayan unido 5 personas con tu invitación, recibirás en rango <@&447475457617821698>, el cual te permite acceder al canal del sorteo.\n\nEste sorteo tendrá una duración máxima de **14 días** desde la fecha de publicación del evento _(podrá ser finalizado prematuramente)_.\n\n**De resultar ganador, podrás elegir entre:**\n\n➢ Player Unknowns Battlegrounds  _(Steam)_\n➢ Grand Theft Auto V  _(Social Club)_\n➢ Counter Strike: Global Offensive  _(Steam)_\n➢ Rainbow Six Siege  _(Uplay)_\n➢ Rocket League  _(Steam)_\n➢ Ghost Recon Wildlands  _(Uplay)_\n➢ Los Sims 4  _(Origin)_\n➢ Battlefield 1  _(Origin)_\n➢ Dark Souls 3  _(Steam)_\n➢ DOOM  _(Steam)_\n➢ Watch Dogs 2  _(Uplay)_\n➢ The Witcher 3: Wild Hunt GOTY Edition  _(GOG Galaxy)_\n➢ Far Cry 4  _(Uplay)_\n➢ Minecraft  _(Mojang)_\n➢ The Elder Scrolls V: Skyrim Special Edition  _(Steam)_\n➢ Arma III  _(Steam)_\n➢ Civilization V: Complete Edition  _(Steam)_\n➢ Killing Floor 2  _(Steam)_\n➢ Titanfall 2  _(Origin)_\n➢ Age of Empires: Definitive Edition  _(Microsoft Store)_\n➢ Just Cause 3  _(Steam)_\n➢ Plants vs. Zombies: Garden Warfare 2  _(Origin)_`)
                .setThumbnail(`https://i.imgur.com/qfamqUv.png`)

            let entryEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setTitle(`Entrada al sorteo`)
                .setDescription(`Participa en el sorteo desde: <#529383165551181824>.\n(solo verás el canal cuando obtengas el rango <@&447475457617821698>).`)
                .setThumbnail(`https://i.imgur.com/jRVtTSF.png`)

            await message.channel.send(giveawayEmbed);
            await message.channel.send(basesEmbed);
            await message.channel.send(entryEmbed);
        } else if (args[0] === `bienvenida`) {
            let noUserEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No has proporcionado un usuario válido`);
            
            let noBotsEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No puedes entablar una conversación con un bot`);
            
            let successEmbed = new discord.MessageEmbed()
                .setColor(resources.green2)
                .setDescription(`${resources.GreenTick} ¡Listo!`);
            
            if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);
            
            let member = await message.guild.members.fetch(message.mentions.users.first() || client.users.fetch(args[1]));
            if (!member) return message.channel.send(noUserEmbed);
            if (member.user.bot) return message.channel.send(noBotsEmbed);
            
            await message.delete().then(client.emit(`guildMemberAdd`, member));
            await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        } else if (args[0] === `despedida`) {
            let noUserEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No has proporcionado un usuario válido`);
            
            let noBotsEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No puedes entablar una conversación con un bot`);
            
            let successEmbed = new discord.MessageEmbed()
                .setColor(resources.green2)
                .setDescription(`${resources.GreenTick} ¡Listo!`);
            
            if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);
            
            let member = await message.guild.members.fetch(message.mentions.users.first() || client.users.fetch(args[1]));
            if (!member) return message.channel.send(noUserEmbed);
            if (member.user.bot) return message.channel.send(noBotsEmbed);
            
            await message.delete().then(client.emit(`guildMemberRemove`, member));
            await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        } else if (args[0] === `oposiciones`) {
            message.delete();
            
            let embed = new discord.MessageEmbed()
                .setColor(resources.blue)
                .setThumbnail(`https://i.imgur.com/WFyNbtO.png`)
                .setAuthor(`Presenta tu oposición a moderador (LATAM)`, resources.server.iconURL())
                .setDescription(`Estamos buscando personas de **LATAM** comprometidas con la comunidad interesadas en "echarnos un cable" moderando el servidor. Necesitamos gente proactiva, seria (pero no demasiado), con experiencia en el uso de Discord ¡y con ganas de ayudar!`)
                .addField(`Si estás interesado, envía la siguiente información vía MD a @EasyXploit:`, `● ¿Como te llamas (nombre y apellidos)?\n● ¿Cual es tu edad?\n● ¿Cual es tu país de residencia?\n● ¿Tienes experiencia moderando?\n● ¿Administras algún otro servidor de Discord?\n● ¿Por que quieres ser moderador?\n\n● Las oposiciones finalizan el día 29 de Octubre de 2020. Tan solo tienes que enviar la información requerida a <@359333470771740683> y este revisará tu oposición y se pondrá en contacto contigo.`, true)
                .attachFiles(`./resources/images/banners/oppositions.png`);
            
            message.channel.send(embed);
        } else if (args[0] === `test`) {

            var ids = [357526716601860107, 382910451165691905, 369613284003020804, 532371239587676190, 376070268818423840];
            function getMember(id){ // sample async action
                return message.guild.members.fetch(id).displayName;
            };
            // map over forEach since it returns

            var actions = ids.map(id => getMember(id)); // run the function over all items

            // we now have a promises array and we want to wait for it

            var results = Promise.all(actions); // pass array of promises

            results.then(data => // or just .then(console.log)
                console.log(data)
            );


        } else {
            let noArgsEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No has especificado una plantilla válida`);
            message.channel.send(noArgsEmbed);
        }
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
