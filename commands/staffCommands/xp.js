exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-xp (@miembro | id) (set | add | remove | clear) <cantidad>
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let unknownMemberEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Los bots no pueden ganar XP`);
        
        let incorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.staffPrefix}xp (@miembro | id) (set | add | remove | clear) <cantidad>\``);

        let incorrectQuantityEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes proporcionar una cantidad válida`);

        let noXPEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Este usuario no tiene XP`);
        

        if (!args[0]) return message.channel.send(unknownMemberEmbed);

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID y no es un bot
        const member = await resources.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(unknownMemberEmbed);
        if (member.user.bot) return message.channel.send(noBotsEmbed);

        //Comprueba si los argumentos se han introducido adecuadamente
        if (!args[1] || args[1] !== 'set' && args[1] !== 'add' && args[1] !== 'remove' && args[1] !== 'clear') return message.channel.send(incorrectSyntaxEmbed);
        if (args[1] !== 'clear' && !args[2] && isNaN(args[2])) return message.channel.send(incorrectQuantityEmbed);

        //Almacena la tabla de clasificación del servidor, y si no existe la crea
        if (message.guild.id in client.stats === false) {
            client.stats[message.guild.id] = {};
        };
        const guildStats = client.stats[message.guild.id];

        //Almacena la tabla de clasificación del usuario, y si no existe la crea
        if (member.id in guildStats === false) {
            guildStats[member.id] = {
                totalXP: 0,
                actualXP: 0,
                level: 0,
                last_message: 0
            };
        };
        const userStats = guildStats[member.id];

        //Comprueba si se le puede restar esa cantidad al usuario
        if (args[1] === 'remove' && userStats.totalXP < args[2]) return message.channel.send(incorrectQuantityEmbed);

        //Comprueba si se le puede quitar el XP al usuario
        if (args[1] === 'clear' && userStats.totalXP == 0) return message.channel.send(noXPEmbed);  

        //Almacena el moderador
        let moderator = await resources.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede añadir XP al usuario en función de la jerarquía de roles
        if (moderator.id !== message.guild.owner.id) {
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed);
        };
        
        //Se declaran variables para almacenar las cantidades de XP
        let oldValue, newValue, level, actualXP;
        oldValue = parseInt(userStats.totalXP);
        level = parseInt(userStats.level);
        actualXP = parseInt(userStats.actualXP);

        //Ejecuta la operación indicada en función del argumento
        switch (args[1]) {
            case 'set':
                client.stats[message.guild.id][member.id].totalXP = parseInt(args[2]);
                newValue = parseInt(args[2]);
                break;

            case 'add':
                client.stats[message.guild.id][member.id].totalXP = oldValue + parseInt(args[2]);
                newValue = oldValue + parseInt(args[2]);
                break;

            case 'remove':
                client.stats[message.guild.id][member.id].totalXP = oldValue - parseInt(args[2]);
                newValue = oldValue - parseInt(args[2]);
                break;

            case 'clear':
                client.stats[message.guild.id][member.id].totalXP = 0;
                client.stats[message.guild.id][member.id].actualXP = 0;
                newValue = 0;
                break;
        };

        //Almacena las recompensas por nivel
        const rewards = require('../../utils/leveling/rewards.json');

        //Función para asignar recompensas
        async function assignRewards() {

            let toReward;

            for (let i = 0; i < rewards.length; i++) {
                let reward = rewards[i];

                if (reward.requiredLevel !== level) {
                    reward.roles.forEach(async role => {
                        if (member.roles.cache.has(role)) await member.roles.remove(role);
                    });
                };

                if (reward.requiredLevel <= level && level !== 0) toReward = reward.roles;
            };

            if (toReward) {
                toReward.forEach(async role => {
                    if (!member.roles.cache.has(role)) await member.roles.add(role);
                });
            };
        };

        if (newValue > oldValue) { //Cambia el nivel y el XP actual
            let xpCount = newValue;
            while ((5 * Math.pow(level, 3) + 50 * level + 100) <= newValue) {
                level++;
                const xpToNextLevel = 5 * Math.pow(level, 3) + 50 * level + 100;
                if (xpCount >= xpToNextLevel) xpCount = xpCount - xpToNextLevel;
            }
            client.stats[message.guild.id][member.id].actualXP = xpCount;
            
            if (level !== client.stats[message.guild.id][member.id].level) {
                client.stats[message.guild.id][member.id].level = level;
                await assignRewards();
            };
        } else if (newValue < oldValue) {

            //Cambia el nivel
            for (let i = 0;; i++) {
                if ((5 * Math.pow(i, 3) + 50 * i + 100) > newValue) {
                    level = i;
                    if (level !== client.stats[message.guild.id][member.id].level) {
                        client.stats[message.guild.id][member.id].level = level;
                        await assignRewards();
                    };
                    break;
                };
            };

            //Cambia el XP actual
            let levelXp = 0;
            if (level > 0) levelXp = 5 * Math.pow((level - 1), 3) + 50 * (level - 1) + 100;
            let xpCount = newValue - levelXp;
            client.stats[message.guild.id][member.id].actualXP = xpCount;
        };

        let successEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setDescription(`${resources.GreenTick} Se ha modificado la cantidad de XP del usuario **${member.user.tag}**.`);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(resources.green)
            .setAuthor('[XP MODIFICADO]', message.guild.iconURL())
            .setDescription(`<@${member.id}>, tu cantidad de XP ha sido modificada`)
            .addField('Moderador', message.author.tag, true)
            .addField('Anterior valor', oldValue, true)
            .addField('Nuevo valor', newValue, true);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.blue)
            .setTitle('📑 Auditoría - [SISTEMA DE XP]')
            .setDescription(`Se ha modificado la cantidad de XP de **${member.user.tag}**.`)
            .addField('Fecha:', new Date().toLocaleString(), true)
            .addField('Moderador:', message.author.tag, true)
            .addField('Miembro:', member.user.tag, true)
            .addField('Anterior valor', oldValue, true)
            .addField('Nuevo valor', newValue, true);

        //Escribe el resultado en el JSON
        fs.writeFile('./storage/stats.json', JSON.stringify(client.stats, null, 4), async err => {
            if (err) throw err;

            await loggingChannel.send(loggingEmbed);
            await member.send(toDMEmbed);
            await message.channel.send(successEmbed);
        });
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};

