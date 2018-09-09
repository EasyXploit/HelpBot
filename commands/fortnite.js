exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    message.channel.send(experimentalEmbed);

    const fortniteClient = require('fortnite');
    const fortnite = new fortniteClient(keys.fortniteApiKey);

    let username = args[0];
    let gamemode = args[1];
    let platform = args[2];
    
    let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setTitle('❌ Ocurrió un error')
            .setDescription('La sintaxis del comando es `' + config.prefix + 'fortnite (usuario) (solo/duo/squad/lifetime) (pc/xb1/psn)`');
    
    if (!username || !gamemode || !platform) return message.channel.send(noCorrectSyntaxEmbed);
    if (gamemode !== 'solo' && gamemode !== 'duo' && gamemode !== 'squad' && gamemode !== 'lifetime') return message.channel.send(noCorrectSyntaxEmbed);
    if (platform !== 'pc' && platform !== 'xb1' && platform !== 'psn') return message.channel.send(noCorrectSyntaxEmbed);
    
    let data = fortnite.user(username, platform).then(data => {
        
        let stats = data.stats;

        if (gamemode === 'solo') {
            let solostats = stats.solo;
            
            let score = solostats.score;
            let kd = solostats.kd;
            let matches = solostats.matches;
            let kills = solostats.kills;
            let wins = solostats.wins;
            let top3 = solostats.top_3;
            
            let resultEmbed = new discord.RichEmbed()
                .setColor(0x8A2BE2)
                .setAuthor('Estadísticas de Fortnite', 'http://s2.googleusercontent.com/s2/favicons?domain_url=https://www.epicgames.com/fortnite/')
                .setTitle('Modo de juego: SOLO')
                .setDescription('Mostrando las estadísticas de ' + data.username)
                .setThumbnail('https://fortnitetracker.com/Images/General/logo.png')
                .addField('Puntuación', score, true)
                .addField('Partidas jugadas', matches, true) 
                .addField('Victorias', wins, true)
                .addField('Top 3s', top3, true)
                .addField('Bajas', kills, true)
                .addField('Ratio B/M', kd, true)
            message.channel.send(resultEmbed);
        } else if (gamemode === 'duo') {
            let duostats = stats.duo;
            
            let score = duostats.score;
            let kd = duostats.kd;
            let matches = duostats.matches;
            let kills = duostats.kills;
            let wins = duostats.wins;
            let top3 = duostats.top_3;
            
            let resultEmbed = new discord.RichEmbed()
                .setColor(0x8A2BE2)
                .setAuthor('Estadísticas de Fortnite', 'http://s2.googleusercontent.com/s2/favicons?domain_url=https://www.epicgames.com/fortnite/')
                .setTitle('Modo de juego: DUO')
                .setDescription('Mostrando las estadísticas de ' + data.username)
                .setThumbnail('https://fortnitetracker.com/Images/General/logo.png')
                .addField('Puntuación', score, true)
                .addField('Partidas jugadas', matches, true) 
                .addField('Victorias', wins, true)
                .addField('Top 3s', top3, true)
                .addField('Bajas', kills, true)
                .addField('Ratio B/M', kd, true)
            message.channel.send(resultEmbed);
        } else if (gamemode === 'squad') {
            let squadstats = stats.squad;
            
            let score = squadstats.score;
            let kd = squadstats.kd;
            let matches = squadstats.matches;
            let kills = squadstats.kills;
            let wins = squadstats.wins;
            let top3 = squadstats.top_3;
            
            let resultEmbed = new discord.RichEmbed()
                .setColor(0x8A2BE2)
                .setAuthor('Estadísticas de Fortnite', 'http://s2.googleusercontent.com/s2/favicons?domain_url=https://www.epicgames.com/fortnite/')
                .setTitle('Modo de juego: SQUAD')
                .setDescription('Mostrando las estadísticas de ' + data.username)
                .setThumbnail('https://fortnitetracker.com/Images/General/logo.png')
                .addField('Puntuación', score, true)
                .addField('Partidas jugadas', matches, true) 
                .addField('Victorias', wins, true)
                .addField('Top 3s', top3, true)
                .addField('Bajas', kills, true)
                .addField('Ratio B/M', kd, true)
            message.channel.send(resultEmbed);
        } else if (gamemode === 'lifetime') {
            let lifetime = stats.lifetime;
            
            let score = lifetime[6] ['Score'];
            let matches = lifetime[7] ['Matches Played'];
            let wins = lifetime[8] ['Wins'];
            let winsper = lifetime[9] ['Win%'];
            let kills = lifetime[10] ['Kills'];
            let kd = lifetime[11] ['K/d'];

            let resultEmbed = new discord.RichEmbed()
                .setColor(0x8A2BE2)
                .setAuthor('Estadísticas de Fortnite', 'http://s2.googleusercontent.com/s2/favicons?domain_url=https://www.epicgames.com/fortnite/')
                .setTitle('Modo de juego: LIFETIME')
                .setDescription('Mostrando las estadísticas de ' + data.username)
                .setThumbnail('https://fortnitetracker.com/Images/General/logo.png')
                .addField('Puntuación', score, true)
                .addField('Partidas jugadas', matches, true) 
                .addField('Victorias', wins, true)
                .addField('Victorias (%)', winsper, true)
                .addField('Bajas', kills, true)
                .addField('Ratio B/M', kd, true)
            message.channel.send(resultEmbed);
        } else {
            message.channel.send(noCorrectSyntaxEmbed);
        }
    }).catch (e => {
        console.log(e.stack);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle('❌ Ocurrió un error')
            .setDescription('No hemos podido encontrar al usuario `' + username + '` en la plataforma `' + platform + '`.')
            .addField('Posible causa', '`' + username + '` no ha jugado todavía al modo de juego `' + gamemode + '`',true)
            .addField('Error', e, true)
        message.channel.send(errorEmbed);
    });
}
