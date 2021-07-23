exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!template (plantilla)
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}template (plantilla)\``);

        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);

        if (args[0] === `bienvenida`) {
            let noUserEmbed = new discord.MessageEmbed()
                .setColor(client.colors.red)
                .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`);
            
            let successEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green2)
                .setDescription(`${client.customEmojis.greenTick} ¡Listo!`);
            
            if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);

            const member = await client.functions.fetchMember(message.guild, args[1]);
            if (!member) return message.channel.send(noUserEmbed);
            
            client.emit(`guildMemberAdd`, member);
            await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        } else if (args[0] === `despedida`) {
            let noUserEmbed = new discord.MessageEmbed()
                .setColor(client.colors.red)
                .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`);
            
            let successEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green2)
                .setDescription(`${client.customEmojis.greenTick} ¡Listo!`);
            
            if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);
            
            let member = await message.guild.members.fetch(message.mentions.users.first() || client.users.fetch(args[1]));
            if (!member) return message.channel.send(noUserEmbed);
            
            client.emit(`guildMemberRemove`, member);
            await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        } else if (args[0] === `cuadrarStats`) {

            let startingEmbed = new discord.MessageEmbed()
                .setColor(client.colors.gray)
                .setTitle(`${client.customEmojis.grayTick} Encuadrando stats`)
                .setDescription('Comenzando operación de encudre de la tabla de clasificación.\nRevisa el terminal para evaluar el progreso del programa.');

            console.log(`${new Date().toLocaleString()} 》Comenzando operación de encudre de stats ...\n\n`);
            message.channel.send(startingEmbed);

            const guildStats = client.stats[message.guild.id];
            const IDs = Object.keys(guildStats);

            let index = 0;
            let interval = setInterval(async function() {

                let member = await client.functions.fetchMember(message.guild, IDs[index]);
                let userStats = guildStats[member.id];

                //USAR SOLO EN CASO DE QUERER CUADRAR NIVELES CON NUEVOS RANGOS SUPERIORES
                //const barrierValue = 15;
                //if (userStats && userStats.level > barrierValue) userStats.level = barrierValue;

                if (member && userStats.level > 0) {
                    if (userStats.totalXP <= 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100) console.log(`Miembro ${member.displayName} omitido\n- - - - - -`);
                    while (userStats.totalXP >= 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100) {
                        await client.functions.addXP(member, message.guild, 'voice').then(
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
                        .setColor(client.colors.green2)
                        .setTitle(`${client.customEmojis.greenTick} Stats encuadradas`)
                        .setDescription('La operación de encuadre de estadísticas ha finalizado.\nPor favor, realice una revisión manual para confirmar su efectividad.');

                    console.log(`\n\n${new Date().toLocaleString()} 》Operación finalizada`);
                    message.channel.send(finishedEmbed);
                };
            }, 1000);

        } else if (args[0] === `test`) {

            console.log(await client.functions.getBotServerInvite());

            /*let startingEmbed = new discord.MessageEmbed()
                .setColor(client.colors.gray)
                .setTitle(`${client.customEmojis.grayTick} Ajustando stats`)
                .setDescription('Comenzando operación de ajuste de la tabla de clasificación.\nRevisa el terminal para evaluar el progreso del programa.');

            console.log(`${new Date().toLocaleString()} 》Comenzando operación de encudre de stats ...\n\n`);
            message.channel.send(startingEmbed);

            const guildStats = client.stats[message.guild.id];
            const IDs = Object.keys(guildStats);

            let index = 0;
            let interval = setInterval(async function() {

                let member = await client.functions.fetchMember(message.guild, IDs[index]);
                let userStats = guildStats[member.id];

                if (member && Math.sign(userStats.actualXP) === -1) {

                    //Almacena el XP para avanzar al siguiente nivel
                    const xpToNextLevel = 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100

                    //Ajusta las stats del miembro
                    userStats.actualXP = xpToNextLevel - userStats.totalXP;

                    //Guarda las nuevas estadísticas del miembro
                    client.fs.writeFile(`./databases/stats.json`, JSON.stringify(client.stats, null, 4), async err => {
                        if (err) throw err;
                        console.log(`La XP actual de ${member.displayName} ha sido sustituida por ${userStats.actualXP}`);
                    });
                } else {
                    console.log(`Miembro ${member.displayName || IDs[index]} omitido\n`);
                };
                
                index++;

                if (index === IDs.length) {
                    clearInterval(interval);

                    let finishedEmbed = new discord.MessageEmbed()
                        .setColor(client.colors.green2)
                        .setTitle(`${client.customEmojis.greenTick} Stats ajustadas`)
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
                .setColor(client.colors.red)
                .setDescription(`${client.customEmojis.redTick} No has especificado una plantilla válida`);
            message.channel.send(noArgsEmbed);
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'run',
    aliases: ['execte', 'exec']
};
