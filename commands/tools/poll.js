exports.run = async (client, message, args, command, commandConfig) => {

    // -poll (new | end) [id]

    try {

        if (args[0] === 'new' || !args[0]) {

            let title;
            let duration = 0;
            let providedDuration;
            let fields = [];

            let titleEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle('📊 Título')
                .setDescription(`Proporciona un título para la encuesta.`);

            let durationEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle('⏱ Duración')
                .setDescription(`Proporciona una duración. Por ejemplo: \`1d 2h 3m 4s\`.\nIntroduce \`-\` para que no tenga fin.`);

            let fieldEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(':one: Campos')
                .setDescription(`Proporciona un nuevo campo (máximo 10).\nEscribe \`end\` para finalizar el asistente.`);

            let options = '';
            let emojiOptions = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];
            let UTFemojis = ['\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3', '\u0035\u20E3', '\u0036\u20E3', '\u0037\u20E3', '\u0038\u20E3', '\u0039\u20E3', '\uD83D\uDD1F'];
            
            async function awaitMessage(msg) {
                let resultMsg;
                const filter = msg => msg.author.id === message.author.id;
                await msg.channel.awaitMessages({filter, max: 1, time: 60000}).then(async collected => {
                    const result = collected.first().content;
                    setTimeout(() => collected.first().delete(), 2000);
                    resultMsg =  result;
                }).catch(() => msg.delete());
                return resultMsg;
            }

            message.channel.send({ embeds: [titleEmbed] }).then(async embed => {
                await awaitMessage(embed).then(async result => {
                    if (!result) return;
                    title = result;
                    embed.edit({ embeds: [durationEmbed] });

                    await awaitMessage(embed).then(async result => {
                        if (!result) return;

                        if (result !== '-') {
                            let inorrectTimeFormatEmbed = new client.MessageEmbed()
                                .setColor(client.config.colors.secondaryError)
                                .setDescription(`${client.customEmojis.redTick} Debes proporcionar una unidad de medida de tiempo. Por ejemplo: \`5d 10h 2m\`.`);

                            let parameters = result.split(' ');

                            function stoms(seg) {return seg * 1000};
                            function mtoms(min) {return min * 60000};
                            function htoms(hour) {return hour * 3600000};
                            function dtoms(day) {return day * 86400000};

                            for (let i = 0; i < parameters.length; i++) {
                                parameters[i] = {
                                    time: parseInt(parameters[i].slice(0, -1)),
                                    measure: parameters[i].slice(-1).toLowerCase()
                                };

                                if (isNaN(parameters[i].time)) return message.channel.send({ embeds: [inorrectTimeFormatEmbed] });
                                if (parameters[i].measure !== 's' && parameters[i].measure !== 'm' && parameters[i].measure !== 'h' && parameters[i].measure !== 'd') return message.channel.send({ embeds: [inorrectTimeFormatEmbed] });

                                let milliseconds;

                                switch (parameters[i].measure) {
                                    case 's':
                                        milliseconds = stoms(parameters[i].time)
                                        break;
                                    case 'm':
                                        milliseconds = mtoms(parameters[i].time);
                                        break;
                                    case 'h':
                                        milliseconds = htoms(parameters[i].time);
                                        break;
                                    case 'd':
                                        milliseconds = dtoms(parameters[i].time);
                                        break;
                                };
                                providedDuration = result;
                                duration = duration + milliseconds;
                            };
                        }

                        embed.edit({ embeds: [fieldEmbed] });

                        for (let i = 0; i < 10; i++) {
                            await awaitMessage(embed).then(async result => {
                                if (!result) return;

                                let anotherFieldEmbed = new client.MessageEmbed()
                                    .setColor(client.config.colors.primary)
                                    .setTitle(`${emojiOptions[i + 1]} Campos`)
                                    .setDescription(`Proporciona un nuevo campo (quedan **${10 - i - 1}**).\nEscribe \`end\` para finalizar el asistente.`);

                                fields[i] = result;
                                embed.edit({ embeds: [anotherFieldEmbed] });
                            })

                            if (!fields[i]) break;

                            if (fields[i] === 'end' && fields.length > 2) {
                                fields.splice(-1,1);
                                break;
                            }
                        };

                        if (fields.length < 2) return;

                        for (count = 0; count < fields.length; count++) {
                            options = options + `${emojiOptions[count]} ${fields[count]}\n\n`
                        };

                        let remainingTime = '∞';
                        if (duration !== 0) {
                            let remainingDays = Math.floor((duration) / (60*60*24*1000));
                            let remainingHours = Math.floor((duration - (remainingDays * 86400000)) / (60*60*1000));
                            let remainingMinutes = Math.floor((duration - (remainingHours * 3600000) - (remainingDays * 86400000)) / (60*1000));
                            remainingTime = `${remainingDays}d ${remainingHours}h ${remainingMinutes}m`
                        };

                        let resultEmbed = new client.MessageEmbed()
                            .setColor('2AB7F1')
                            .setAuthor({ name: 'Encuesta disponible', iconURL: 'attachment://poll.png' })
                            .setDescription(`**${title}**\n\n${options}`)
                            .setFooter({ text: `Duración: ${remainingTime}` });
                        
                        message.channel.send({ embeds: [resultEmbed], files: ['./resources/images/poll.png'] }).then(async poll => {
                            embed.delete();
                            for (count = 0; count < fields.length; count++) {
                                await poll.react(UTFemojis[count]);
                            };

                            if (duration !== 0) {
                                client.polls[poll.id] = {
                                    duration: Date.now() + duration,
                                    channel: message.channel.id,
                                    title: title,
                                    options: options
                                }
                        
                                client.fs.writeFile('./databases/polls.json', JSON.stringify(client.polls, null, 4), async err => {
                                    if (err) throw err;
                                });
                            };

                            let loggingEmbed = new client.MessageEmbed()
                                .setColor(client.config.colors.logging)
                                .setAuthor({ name: `${message.member.user.tag} ha iniciado una ENCUESTA`, iconURL: message.member.user.displayAvatarURL({dynamic: true}) })
                                .addField(`Título`, `__[${title}](${poll.url})__`, true)
                                .addField(`Canal`, `<#${message.channel.id}>`, true)
                                .addField(`Duración`, providedDuration, true);
                            
                            await client.functions.loggingManager(loggingEmbed);
                        });
                    });
                });
            });
        } else if (args[0] === 'end' && args[1] && !isNaN(args[1])) {

            let notFoundEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} La encuesta con ID ${args[1]} no se ha podido encontrar`);

            if (!client.polls[args[1]]) return message.channel.send({ embeds: [notFoundEmbed] });

            let channel = await client.channels.fetch(client.polls[args[1]].channel);
            let poll = await channel.messages.fetch(args[1])

            if (!poll) return message.channel.send({ embeds: [notFoundEmbed] });

            client.polls[args[1]].duration = Date.now();

            client.fs.writeFile(`./databases/polls.json`, JSON.stringify(client.polls), async err => {
                if (err) throw err;
            });
        } else {
            return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es ${client.config.guild.prefix}poll (new | end) [id]`)
            ] });
        }

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'poll',
    aliases: []
};
