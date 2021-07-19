exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!setup
    
    try {

        //ASISTENTE INTERACTIVO (advertencia si no se configuran los necesarios)
            //botManagerRole - Bypass igual que si fueses owner
            //loggingChannel,
            //debuggingChannel
            //joinsAndLeavesChannel
            //botChatChannel
            //OPCIONAL: prefix - Informar sobre prefix por defecto

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};
