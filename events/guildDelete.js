exports.run = async (guild, client, discord) => {
    
    try {
        console.log(`\n 》${client.user.username} ha abandonado la guild "${guild.name}".`);
    } catch (error) {
        console.log(`${new Date().toLocaleString()} 》${e.stack}`);
    };
};
