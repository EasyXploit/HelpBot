exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //$plantilla (plantilla)
    
    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(emojis.RedTick + ' La sintaxis de este comando es `' + config.ownerPrefix + 'plantilla (plantilla)`');

        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);

        if (args[0] === 'afiliados') {
            message.delete();

            let resultEmbed = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setTitle('Comunidades afiliadas')
                .setDescription('Aquí se muestra un listado con las comunidades que participan en el programa de afiliaciones de la comunidad.\n\nSi quieres participar en este programa, ponte en contacto con nosotros enviando un mensaje directo a <@359333470771740683>')
                .setThumbnail('https://i.imgur.com/Dj1xJqK.png');
            message.channel.send(resultEmbed);
        } else if (args[0] === 'valgreen') {
            message.delete();

            let resultEmbed = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setTitle('Comunidad hispanohablante de videojugadores')
                .setAuthor('ValGreen Gaming', 'https://i.imgur.com/dlusDji.png')
                .setURL('https://discord.gg/m4EdakX')
                .setDescription('● Tenemos nuestro propio equipo de E-sports\n● Jugamos a gran variedad de juegos: CSGO, Fortnite, Brawlhalla...\n● ¿Quieres jugar en el equipo competitivo? ¡¡Contacta con los mods del reino o el rey de la ciénaga!!\n● Tenemos minijuegos in-chat\n● Creamos nuestros propios torneos y sorteos')
                .setThumbnail('https://i.imgur.com/dlusDji.png');
            await message.channel.send(resultEmbed);
            await message.channel.send('https://discord.gg/m4EdakX');
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
        } else {
            let noArgsEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(emojis.RedTick + ' No has especificado una plantilla válida');
            message.channel.send(noArgsEmbed);
        }
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
