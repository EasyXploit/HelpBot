exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
            
    message.delete();
    
    if (args[0] === 'valgreen') {
        let resultEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setTitle('Comunidad hispanohablante de videojugadores')
            .setAuthor('ValGreen Gaming', 'https://i.imgur.com/dlusDji.png')
            .setURL('https://discord.gg/m4EdakX')
            .setDescription('● Tenemos nuestro propio equipo de E-sports\n● Jugamos a gran variedad de juegos: CSGO, Fortnite, Brawlhalla...\n● ¿Quieres jugar en el equipo competitivo? ¡¡Contacta con los mods del reino o el rey de la ciénaga!!\n● Tenemos minijuegos in-chat\n● Creamos nuestros propios torneos y sorteos')
            .setThumbnail('https://i.imgur.com/dlusDji.png');
        await message.channel.send(resultEmbed);
        await message.channel.send('https://discord.gg/m4EdakX');
    } else {
        let resultEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setTitle('Comunidades afiliadas')
            .setDescription('Aquí se muestra un listado con las comunidades que participan en el programa de afiliaciones de la comunidad.\n\nSi quieres participar en este programa, ponte en contacto con nosotros enviando un mensaje directo a <@359333470771740683>')
            .setThumbnail('https://i.imgur.com/Dj1xJqK.png');
        message.channel.send(resultEmbed);
    }
}
