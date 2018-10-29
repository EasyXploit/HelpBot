exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!fortnite "usuario" "solo/duo/squad/lifetime" "pc/xbl/psn"
    
    try {
        const fortniteClient = require('fortnite');
        const fortnite = new fortniteClient(keys.fortnite);

        let fields = message.content.slice(11).split('" "');
        let lastField = fields.slice(-1).join();

        lastField = lastField.substring(0, lastField.length - 1);
        fields.splice(-1);
        fields.push(lastField);

        let username = fields[0];
        let gamemode = fields[1];
        let platform = fields[2];

        let thumbnail = 'https://toppng.com/public/uploads/preview/fortnite-battle-royale-logo-11530963305mex6keb5qj.png';

        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(resources.RedTick + ' La sintaxis de este comando es `' + config.prefix + 'fortnite "usuario" "solo/duo/squad/lifetime" "pc/xbl/psn"`');

        if (!username || !gamemode || !platform) return message.channel.send(noCorrectSyntaxEmbed);
        if (gamemode !== 'solo' && gamemode !== 'duo' && gamemode !== 'squad' && gamemode !== 'lifetime') return message.channel.send(noCorrectSyntaxEmbed);
        if (platform !== 'pc' && platform !== 'xbl' && platform !== 'psn') return message.channel.send(noCorrectSyntaxEmbed);

        let data = fortnite.user(username, platform).then(data => {

            let stats = data.stats;

            if (gamemode === 'solo') {
                let solostats = stats.solo;

                let score = solostats.score;
                let kd = solostats.kd;
                let matches = solostats.matches;
                let kills = solostats.kills;
                let kills_per_match = solostats.kills_per_match;
                let score_per_match = solostats.score_per_match;
                let wins = solostats.wins;
                let top_5 = solostats.top_5;

                let resultEmbed = new discord.RichEmbed()
                    .setColor(0x8A2BE2)
                    .setAuthor('Estadísticas de Fortnite', 'http://s2.googleusercontent.com/s2/favicons?domain_url=https://www.epicgames.com/fortnite/')
                    .setTitle('Modo de juego: SOLO')
                    .setDescription('Mostrando las estadísticas de __' + data.username + '__ en __' + platform.toUpperCase() + '__')
                    .setThumbnail(thumbnail)
                    .addField('Puntuación', score, true)
                    .addField('Partidas jugadas', matches, true) 
                    .addField('Victorias', wins, true)
                    .addField('Bajas', kills, true)
                    .addField('Ratio B/M', kd, true)
                    .addField('Bajas por partida', kills_per_match, true)
                    .addField('Puntuación por partida', score_per_match, true)
                    .addField('Top 5', top_5 + ' veces', true)
                    .setFooter('© 2018 República Gamer LLC', resources.server.iconURL);
                message.channel.send(resultEmbed);
            } else if (gamemode === 'duo') {
                let duostats = stats.duo;

                let score = duostats.score;
                let kd = duostats.kd;
                let matches = duostats.matches;
                let kills = duostats.kills;
                let kills_per_match = duostats.kills_per_match;
                let score_per_match = duostats.score_per_match;
                let wins = duostats.wins;   
                let top_5 = duostats.top_5;

                let resultEmbed = new discord.RichEmbed()
                    .setColor(0x8A2BE2)
                    .setAuthor('Estadísticas de Fortnite', 'http://s2.googleusercontent.com/s2/favicons?domain_url=https://www.epicgames.com/fortnite/')
                    .setTitle('Modo de juego: DUO')
                    .setDescription('Mostrando las estadísticas de __' + data.username + '__ en __' + platform.toUpperCase() + '__')
                    .setThumbnail(thumbnail)
                    .addField('Puntuación', score, true)
                    .addField('Partidas jugadas', matches, true) 
                    .addField('Victorias', wins, true)
                    .addField('Bajas', kills, true)
                    .addField('Ratio B/M', kd, true)
                    .addField('Bajas por partida', kills_per_match, true)
                    .addField('Puntuación por partida', score_per_match, true)
                    .addField('Top 5', top_5 + ' veces', true)
                    .setFooter('© 2018 República Gamer LLC', resources.server.iconURL);
                message.channel.send(resultEmbed);
            } else if (gamemode === 'squad') {
                let squadstats = stats.squad;

                let score = squadstats.score;
                let kd = squadstats.kd;
                let matches = squadstats.matches;
                let kills = squadstats.kills;
                let kills_per_match = squadstats.kills_per_match;
                let score_per_match = squadstats.score_per_match;
                let wins = squadstats.wins;
                let top3 = squadstats.top_3;

                let resultEmbed = new discord.RichEmbed()
                    .setColor(0x8A2BE2)
                    .setAuthor('Estadísticas de Fortnite', 'http://s2.googleusercontent.com/s2/favicons?domain_url=https://www.epicgames.com/fortnite/')
                    .setTitle('Modo de juego: SQUAD')
                    .setDescription('Mostrando las estadísticas de __' + data.username + '__ en __' + platform.toUpperCase() + '__')
                    .setThumbnail(thumbnail)
                    .addField('Puntuación', score, true)
                    .addField('Partidas jugadas', matches, true) 
                    .addField('Victorias', wins, true)
                    .addField('Bajas', kills, true)
                    .addField('Ratio B/M', kd, true)
                    .addField('Bajas por partida', kills_per_match, true)
                    .addField('Puntuación por partida', score_per_match, true)
                    .addField('Top 3', top3 + ' veces', true)
                    .setFooter('© 2018 República Gamer LLC', resources.server.iconURL);
                message.channel.send(resultEmbed);
            } else if (gamemode === 'lifetime') {
                let lifetime = stats.lifetime;

                let score = lifetime[6] ['Score'];
                let matches = lifetime[7] ['Matches Played'];
                let wins = lifetime[8] ['Wins'];
                let winsper = lifetime[9] ['Win%'];
                let kills = lifetime[10] ['Kills'];
                let kd = lifetime[11] ['K/d'];
                let top3 = lifetime[1] ['Top 3s'];

                let footer = '';

                if (wins >= 1000) {
                    thumbnail = 'https://image.fnbr.co/misc/5ab282b5ca60ff23958a3e77/icon.png';
                    footer = '¡Vaya! Al parecer estás muy enganchado a este juego ...';
                } else {
                    footer = '© 2018 República Gamer LLC';
                }

                let resultEmbed = new discord.RichEmbed()
                    .setColor(0x8A2BE2)
                    .setAuthor('Estadísticas de Fortnite', 'http://s2.googleusercontent.com/s2/favicons?domain_url=https://www.epicgames.com/fortnite/')
                    .setTitle('Modo de juego: LIFETIME')
                    .setDescription('Mostrando las estadísticas de __' + data.username + '__ en __' + platform.toUpperCase() + '__')
                    .setThumbnail(thumbnail)
                    .setFooter(footer,resources.server.iconURL)
                    .addField('Puntuación', score, true)
                    .addField('Partidas jugadas', matches, true) 
                    .addField('Victorias', wins, true)
                    .addField('Victorias (%)', winsper, true)
                    .addField('Bajas', kills, true)
                    .addField('Ratio B/M', kd, true)
                    .addField('Top 3', top3 + ' veces', true)
                message.channel.send(resultEmbed);
            } else {
                message.channel.send(noCorrectSyntaxEmbed);
            }
        }).catch (e => {
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setTitle(resources.RedTick + ' Ocurrió un error')
                .setDescription('No hemos podido encontrar al usuario `' + username + '` en la plataforma `' + platform + '`.')
                .addField('Posibles causas', '● El usuario `' + username +'` no existe o nunca ha jugado\n● `' + username + '` no ha jugado en la plataforma `' + platform +'` o al modo de juego `'+ gamemode +'`\n● El usuario ha cambiado de nombre de usuario\n● La API no tiene registrada ninguna estadística del usuario `' + username + '`',true)
            message.channel.send(errorEmbed);
        });
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
