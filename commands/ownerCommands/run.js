exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //$template (plantilla)
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.ownerPrefix}template (plantilla)\``);

        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);

        if (args[0] === `informacion`) {
            message.delete();

            const cfg = require('../../configs/config.json');
            
            let embed1 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setDescription(`${resources.republicagamer} **Bienvenido al servidor oficial de la República Gamer en Discord**\nA continuación te explicaremos la dinámica de este servidor:`)
                .attachFiles(`./resources/images/banners/logo_banner_transparent.png`);
            
            let embed2 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setAuthor(`REGLAMENTO DE LA COMUNIDAD`, `https://i.imgur.com/jAiDAvR.png`)
                .setDescription('Este servidor se apoya en los [**Términos de Servicio**](https://discordapp.com/terms) y las [**Directivas de la comunidad de Discord**](https://discordapp.com/guidelines). Participar en la comunidad supone la aceptación de las normas expuestas en este documento.')
                .addField(`:one: No está permitido publicar contenido inadecuado:`, `Es decir, todo lo relacionado con pornografía, drogas y apuestas. Tampoco contenido que pueda alentar el odio hacia una etnia, religión o cualquier otro colectivo/individuo. De la misma forma están prohibidas las actitudes tóxicas, faltas de respeto, el acoso, el gore y/o crueldad animal y el envío de pornografía infantil o estafas.`)
                .addField(`:two: Está prohibido hacer spam:`, `No puedes enviar links hacia otros servidores de Discord _(tanto invitaciones como URL redireccionadas o spam relacionado)_, ni links de afiliado ni spamear (incluyendo mensajes directos). Tampoco puedes abusar de las menciones a los demás usuarios y también está prohibido hacer _flood_ de chat. De igual forma, no publiques enlaces de invitación de este servidor en otros servidores sin su consentimiento.`)
                .addField(`:three: No abuses de las menciones:`, 'No está permitido excederse utilizando las menciones a personas, a __roles__, o a `@everyone` y `@here`. _Las menciones abusivas pueden ser realmente molestas y pueden llevar a los usuario a silenciar el servidor._')
                .addField(`:four: Respeta las temáticas:`, `Has de usar los canales de texto/voz adecuados en cada caso. Lee los temas de los canales para más información.`)
                .addField(':five: Uso adecuado de cuentas:', 'Así cómo no está permitido publicar contenido inadecuado, la misma norma aplica para los nombres de usuario. No está permitido emplear nombres de usuario de Discord o apodos inadecuados, cómo palabras ofensivas, enlaces o carácteres ilegibles por sistemas automatizados. Por otro lado, tampoco se permite el empleo de cuentas múltiples para unirse a la comunidad y/o eventualmente, sobrepasar las sanciones aplicadas a las cuentas.')
                .addField(`:six: No busques vacíos legales:`, 'No intentes hacer algo que obviamente pueda resultar inadecuado tanto para el staff como para el resto de usuarios de la comunidad.\n\n```La infracción de la normativa conllevará desde sanciones administrativas (warn, mute, ban o kick) hasta avisos a las autoridades (en el caso de actividades ilegales).```')
                .attachFiles(`./resources/images/banners/rules.png`);
            
            let embed3 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setDescription(`:grey_question: Escribe \`!ayuda\` en cualquier canal de texto para acceder al sistema de ayuda.\n\n📓 Escribe \`!normas\` para mostrar las normas del servidor.\n\n${resources.pilkobot} Escribe \`!pilko\` para mostrar los comandos de <@446041159853408257>.\n\n:robot: Escribe \`!comandos\` para mostrar los comandos de los bots.\n\n:military_medal: Escribe \`!rangos\` para mostrar los rangos, la tabla de puntuaciones y tu nivel.`)
                .attachFiles(`./resources/images/banners/help.png`);
            
            let embed4 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail(`https://i.imgur.com/vDgiPwT.png`)
                .setAuthor(`NIVELES`, `https://i.imgur.com/vDgiPwT.png`)
                .setDescription('Los usuarios que participan __activamente__ en la comunidad (tanto en canales de texto cómo en canales de voz) adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:')
                .addField(`${resources.chevron1} Lvl 1 ‣ NOVATO I`, 'Permite **publicar en <#428234707927564299>**.\nObtienes __50 créditos__ de bienvenida.')
                .addField(`${resources.chevron2} Lvl 5 ‣ NOVATO V`, 'Permite **adjuntar archivos** e **insertar enlaces**.\nObtienes __100 créditos__.')
                .addField(`${resources.chevron3} Lvl 10 ‣ PROFESIONAL V`, `Permite **cambiar tu apodo** y **usar emojis externos**${resources.nitro}.\nObtienes __200 créditos__.`)
                .addField(`${resources.chevron4} Lvl 15 ‣ EXPERTO V`, 'Permite **manejar la música** y **enviar mensajes TTS**.\nObtienes __300 créditos__.')
                .addField(`${resources.chevron5} Lvl 15 ‣ VETERANO V`, 'Permiite utilizar la  **prioridad de palabra**.\nObtienes __400 créditos__.')
                .addField('● Estadísticas', 'Usa `!rank` para conocer tu nivel.\nUsa `!leaderboard` para ver la tabla de clasificación.')
                .attachFiles(`./resources/images/banners/ranks.png`);

            let embed5 = new discord.MessageEmbed()
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
            await message.channel.send(cfg.serverInvite);
            
        } else if (args[0] === `ayudanos`) {
            message.delete();

            let embed1 = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setDescription(`${resources.republicagamer} **¡Tu apoyo es importante para nosotros!**\nLo mejor que puedes hacer para apoyarnos es __participar activamente__ tanto en los _canales de texto_ como en los _canales de voz_, pero aquí te mostramos de que forma puedes __apoyar aun más__ el crecimiento de la comunidad.`)
                .attachFiles('./resources/images/banners/logo_banner_transparent.png');

            let donateEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail('https://i.imgur.com/E26Kl1A.png')
                .setAuthor('DONATIVOS', 'https://i.imgur.com/E26Kl1A.png')
                .setDescription('Hemos habilitado una nueva forma de apoyar directamente al desarrollo de la comunidad, permitiendo aceptar vestros donativos. Como recompensa, y en función del tipo de suscripción elegida, puedes optar por uno de los siguientes rangos:\n\n⬖ **RANGO VIP** 🔒\n⬖ **RANGO SUPPORTER** 💓')
                
                .addField('¿Qué ventajas tengo? ¿Cómo puedo donar?', 'Para obtener detalles acerca de las ventajas de cada rango y adquirir uno, haz clic en [este enlace](https://donatebot.io/checkout/374945492133740544).\n\nTambién es posible adquirir un rango para otra persona, además de poder donar cualquier cantidad que desees.\n\n⮚ [**DONAR**](https://donatebot.io/checkout/374945492133740544) ⮘')
                .attachFiles(`./resources/images/banners/donate.png`);

            let supporterEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail('https://i.imgur.com/0l3jSuV.png')
                .setAuthor('RANGO SUPPORTER', 'https://i.imgur.com/0l3jSuV.png')
                .setDescription('Aquellos usuarios que traen a __gente nueva__ a la comunidad son recompensados con el rango **@SUPPORTER**, que permite acceder a varias ventajas, entre las que destacan el **acceso preferente a los sorteos**, poder **cambiar su propio apodo** y usar **emojis externos**.')
                .addField('🞘 Pasos a seguir:', ':one: Genera una invitación instantánea. [Ver cómo](https://support.discordapp.com/hc/es/articles/208866998-Invitaci%C3%B3n-Instant%C3%A1nea-101)\n:two: Invita a 5 personas _(procura que se unan y se queden)_.\n:three: ¡Recibirás tu rol cuando se unan 5! _(lo perderás si se van)_.', true)
                .addField('🞘 Comandos:', 'Usa `+invites` para conocer a cuantos has invitado.\nUsa `+leaderboard` para ver la tabla de clasificacion.', true)
                .attachFiles(`./resources/images/banners/support.png`);

            let boostEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail('https://i.imgur.com/SdgPR5G.png')
                .setAuthor('BOOSTEA LA COMUNIDAD', 'https://i.imgur.com/SdgPR5G.png')
                .setDescription('Con cada mejora del servidor nos ayudas a desbloquear __nuevos niveles__ y más __ventajas para todos los miembros__ del servidor, cómo **espacios para emojis**, **mejor calidad de audio**,** mejor calidad de retransmisión**, mejora en el **límite de carga de ficheros** y algunos ajustes de **personalización** adicionales para la comunidad.\n\n⮚ [**MÁS INFORMACIÓN**](https://support.discord.com/hc/es/articles/360028038352) ⮘')
                .attachFiles('./resources/images/banners/boost.png');

            let voteEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail('https://i.imgur.com/pIWa9r4.png')
                .setAuthor('¡VÓTANOS!', 'https://i.imgur.com/pIWa9r4.png')
                .setDescription('Con tu voto, nos ayudas a ser más visibles para el resto del mundo, por lo que el servidor crecerá gracias a tí. Danos una manita para arriba votando en estas páginas:')
                .addField('Topg.gg', '[VOTAR](https://top.gg/servers/374945492133740544/vote)', true)
                .addField('TrackyServer', '[VOTAR](https://www.trackyserver.com/es/server/repblica-gamer-606898)', true)
                .addField('Disboard', '[RESEÑAR](https://disboard.org/es/review/create/374945492133740544)', true)
                .attachFiles(`./resources/images/banners/vote.png`);

            let reviewEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail('https://i.imgur.com/teuQnub.png')
                .setAuthor('ESCRIBE UNA RESEÑA', 'https://i.imgur.com/teuQnub.png')
                .setDescription('En la **República Gamer** nos tomamos muy en serio la opinión de nuestros usuarios y __tratamos de mejorar constantemente__ en base a vuestros _comentarios_ y _sugerencias_.\n\nPor ello, te agradeceríamos que nos escribieras **una reseña** para que así el resto del mundo pueda ver que tal lo estamos haciendo y si merece la pena unirse a la comunidad.\n\n⮚ [**ESCRIBIR UNA RESEÑA**](https://disboard.org/es/review/create/374945492133740544) ⮘')
                .attachFiles(`./resources/images/banners/review.png`);

            let inviteEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail('https://i.imgur.com/lAuMp84.png')
                .setAuthor('INVITA A TUS AMIGOS', 'https://i.imgur.com/lAuMp84.png')
                .setDescription(`Una de las mejores formas de hacer crecer la comunidad es ... ¡con nuevos miembros!. Y además, ¿a que es más divertido charlar y jugar con amigos?\n\n**ENVÍA ESTE ENLACE A TUS AMIGOS:**\n[${config.serverInvite}](${config.serverInvite})\n\nAlternativamente, puedes generar [tu propio enlace de invitación](https://support.discordapp.com/hc/es/articles/208866998-Invitaci%C3%B3n-Instant%C3%A1nea-101), de esta forma las invitaciones contarán a la hora de adquirir el __rango Supporter__.`)
                .attachFiles(`./resources/images/banners/invite.png`);
            
            let bumpEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail('https://i.imgur.com/n2pPl4m.png')
                .setAuthor('EMPUJA EL SERVIDOR', 'https://i.imgur.com/n2pPl4m.png')
                .setDescription('Una buena forma de ayudarnos, es haciendo **"bump"** en la lista de servidores de [Disborad](https://disboard.org/). Para ello, solo debes seguir estos pasos:')
                .addField('🞘 Pasos a seguir:', ':one: Dirígete al canal de <#757980935693140008>.\n:two: Escribe el comando `!d bump`.\n\nSi han pasado más de 2h, __¡habrás dado un empujoncito al server!__, de lo contrario tendrás que esperar un tiempo antes de volver a hacer bump (puede que otro miembro ya lo haya hecho 😬).')
                .attachFiles(`./resources/images/banners/bump.png`);

            await message.channel.send(embed1);
            await message.channel.send(donateEmbed);
            await message.channel.send(supporterEmbed);
            await message.channel.send(boostEmbed);
            await message.channel.send(voteEmbed);
            await message.channel.send(reviewEmbed);
            await message.channel.send(inviteEmbed);
            await message.channel.send(bumpEmbed);
        } else if (args[0] === `partners`) {
            message.delete();

            let embed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setThumbnail('https://i.imgur.com/SfjviLY.png')
                .setAuthor('PROGRAMA DE PARTNERS', 'https://i.imgur.com/SfjviLY.png')
                .setDescription('Mediante este formulario podrás presentar una solicitud para formar parte de los asociados (partners o aliados) de la comunidad.\nLos asociados gozarán de privilegios como promociones cruzadas entre comunidades (canal con invitación), roles especiales (con ventajas para los asociados) y eventos conjuntos (tales cómo torneos y sorteos conjuntos)\n\nLos requisitos para acceder a este programa se describen en el enlace que tienes continuación:\n\n⮚ [**FORMULARIO DE INSCRIPCIÓN**](https://forms.gle/zv41XmZsV4xrXU1c6) ⮘\n\n**AVISO:** Este programa se encuentra en fase de desarrollo temprano, por lo que las bases finales y el sistema de afiliación están pendientes de ser descritos en su totalidad. Formalizar la inscripción y cumplir todos los requisitos no te asegura una futura inclusión en este sistema.')
                .attachFiles(`./resources/images/banners/partner.png`);

            await message.channel.send(embed);
        } else if (args[0] === `sorteo`) {
            message.delete();

            let giveawayEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setTitle('🎄 🎊 🎄 SORTEO DE NAVIDAD 🎄 🎊 🎄')
                .setDescription('**¡HO HO HO!** Llega la navidad y Papá Noel viene cargado de regalos para los miembros de la comunidad que __participen activamente en la comunidad__, para los que __boosteen el servidor__ y para los que __compartan la comunidad con sus amigos__!\n\n**ESTO ES LO QUE PUEDES GANAR:**\n\n➢ 2 claves de Red Dead Online (Epic)\n➢ 1 clave de PayDay 2 (Steam)\n➢ 1 clave de Discord Nitro (Normal)\n➢ 3 meses de Xbox Game Pass (PC)')
                .setThumbnail('https://i.imgur.com/G3XjaFA.png')

            let basesEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setTitle(`📑 BASES DEL SORTEO`)
                .setDescription(`El sorteo comienza oficialmente el día **15 de DICIEMBRE** de 2020 y finalizará el día **25 de DICIEMBRE** de 2020.\n\n**SOLO DEBES CUMPLIR 1 DE ESTOS REQUISITOS**:\n\n➢ Haber alcanzado el rango <@&393536958187569153>\n➢ Haber **boosteado el servidor**\n➢ Haber **traido 5 personas** con una __ invitación personalizada__\n\nEste sorteo tendrá una duración máxima de **10 días** desde la fecha de publicación del evento _(podrá ser finalizado prematuramente)_.`)
                .setThumbnail('https://i.imgur.com/zilbaLQ.png')

            let entryEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setTitle(`🗳 ENTRADA AL SORTEO`)
                .setDescription(`Participa en el sorteo desde: <#788164998408568872>.\n(solo verás el canal cuando cumplas 1 requisito).`)
                .setThumbnail('https://i.imgur.com/if6itZS.png')

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

            const member = await resources.fetchMember(message.guild, args[1]);
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
        } else if (args[0] === `cuadrarStats`) {

            let startingEmbed = new discord.MessageEmbed()
                .setColor(resources.gray)
                .setTitle(`${resources.GrayTick} Encuadrando stats`)
                .setDescription('Comenzando operación de encudre de la tabla de clasificación.\nRevisa el terminal para evaluar el progreso del programa.');

            console.log(`${new Date().toLocaleString()} 》Comenzando operación de encudre de stats ...\n\n`);
            message.channel.send(startingEmbed);

            const guildStats = client.stats[message.guild.id];
            const IDs = Object.keys(guildStats);

            let index = 0;
            let interval = setInterval(async function() {

                let member = await resources.fetchMember(message.guild, IDs[index]);
                let userStats = guildStats[member.id];

                //USAR SOLO EN CASO DE QUERER CUADRAR NIVELES CON NUEVOS RANGOS SUPERIORES
                //const barrierValue = 15;
                //if (userStats && userStats.level > barrierValue) userStats.level = barrierValue;

                if (member && userStats.level > 0) {
                    if (userStats.totalXP <= 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100) console.log(`Miembro ${member.displayName} omitido\n- - - - - -`);
                    while (userStats.totalXP >= 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100) {
                        await resources.addXP(fs, config, member, message.guild, 'voice').then(
                            console.log(`Miembro ${member.displayName} actualizado\n- - - - - -`)
                        );
                    };
                } else {
                    console.log(`Usuario ${IDs[index]} omitido\n- - - - - -`);
                };
                
                index++;

                if (index === IDs.length) {
                    clearInterval(interval);

                    let finishedEmbed = new discord.MessageEmbed()
                        .setColor(resources.green2)
                        .setTitle(`${resources.GreenTick} Stats encuadradas`)
                        .setDescription('La operación de encuadre de estadísticas ha finalizado.\nPor favor, realice una revisión manual para confirmar su efectividad.');

                    console.log(`\n\n${new Date().toLocaleString()} 》Operación finalizada`);
                    message.channel.send(finishedEmbed);
                };
            }, 1000);

        } else if (args[0] === `test`) {

            /*let startingEmbed = new discord.MessageEmbed()
                .setColor(resources.gray)
                .setTitle(`${resources.GrayTick} Ajustando stats`)
                .setDescription('Comenzando operación de ajuste de la tabla de clasificación.\nRevisa el terminal para evaluar el progreso del programa.');

            console.log(`${new Date().toLocaleString()} 》Comenzando operación de encudre de stats ...\n\n`);
            message.channel.send(startingEmbed);

            const guildStats = client.stats[message.guild.id];
            const IDs = Object.keys(guildStats);

            let index = 0;
            let interval = setInterval(async function() {

                let member = await resources.fetchMember(message.guild, IDs[index]);
                let userStats = guildStats[member.id];

                if (member && Math.sign(userStats.actualXP) === -1) {

                    //Almacena el XP para avanzar al siguiente nivel
                    const xpToNextLevel = 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100

                    //Ajusta las stats del miembro
                    userStats.actualXP = xpToNextLevel - userStats.totalXP;

                    //Guarda las nuevas estadísticas del usuario
                    fs.writeFile(`./storage/stats.json`, JSON.stringify(client.stats, null, 4), async err => {
                        if (err) throw err;
                        console.log(`La XP actual de ${member.displayName} ha sido sustituida por ${userStats.actualXP}`);
                    });
                } else {
                    console.log(`Usuario ${member.displayName || IDs[index]} omitido\n`);
                };
                
                index++;

                if (index === IDs.length) {
                    clearInterval(interval);

                    let finishedEmbed = new discord.MessageEmbed()
                        .setColor(resources.green2)
                        .setTitle(`${resources.GreenTick} Stats ajustadas`)
                        .setDescription('La operación de ajuste de estadísticas ha finalizado.\nPor favor, realice una revisión manual para confirmar su efectividad.');

                    console.log(`\n\n${new Date().toLocaleString()} 》Operación finalizada`);
                    message.channel.send(finishedEmbed);
                };
            }, 1000);*/

            /*var ids = [357526716601860107, 382910451165691905, 369613284003020804, 532371239587676190, 376070268818423840];
            function getMember(id){ // sample async action
                return message.guild.members.fetch(id).displayName;
            };
            // map over forEach since it returns

            var actions = ids.map(id => getMember(id)); // run the function over all items

            // we now have a promises array and we want to wait for it

            var results = Promise.all(actions); // pass array of promises

            results.then(data => // or just .then(console.log)
                console.log(data)
            );*/
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
