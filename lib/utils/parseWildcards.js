// Function to replace placeholders in text strings
export default async (string) => {

    try {

        // Stores the detected placeholders
        const placeHolders = string.match(/{{\s?([^{}\s]*)\s?}}/g);

        // If placeholders were found
        if (placeHolders !== null) {

            // Creates an object to store the interpreted values
            let wildcards = {};

            // For each of the placeholders
            for (let placeHolder of placeHolders) {

                // Removes the delimitators of the placeholder
                placeHolder = placeHolder.replace('{{', '').replace('}}', '');
                
                // Depending on the type of placeholder
                switch (placeHolder) {

                    // If it is for the name of the server
                    case 'guildName':

                        // Stores the name of the guild
                        wildcards[placeHolder] = client.baseGuild.name;
                        
                        // Stops the switch
                        break;

                    // If it is for the members count
                    case 'memberCount':

                        // Calculates the number of guild members
                        const guildMembers = await client.baseGuild.members.fetch();

                        // Stores the number of guild members
                        wildcards[placeHolder] = guildMembers.size;
                        
                        // Stops the switch
                        break;

                    // Omits if an invalid placeholder was provided
                    default: break;
                };
            };

            // Changes the placeholders for their real values
            return await client.functions.utils.parseLocale(string, wildcards);
        };

        // Returns the string without modifying
        return string;

    } catch (error) {

        // Shows an error through the console
        logger.error(error.stack);

        // Returns an erroneous state
        return false;
    };
};
