// Function to generate messages and embeds from a structured object
export default async (assembleData) => {

    try {

        // Stores the final result
        let resultData = {};

        // If the message contains a content (without embed)
        if (assembleData.content && assembleData.content.length > 0) {

            // Replaces the placeholders of the content of the message with their real values
            assembleData.content = await client.functions.utils.parseWildcards(assembleData.content);
        
            // Shortens the message content if it exceeds the maximum, and stores it in the result object
            resultData.content = assembleData.content.length > 4096 ? `${assembleData.content.slice(0, 4092)} ...` : assembleData.content;
        };

        // If the message contains an embed
        if (assembleData.embed) {

            // Generates an embed to add properties
            resultData.embeds = [ new discord.EmbedBuilder() ];

            // Stores the properties of the embed
            let embedData = assembleData.embed;

            // If the embed must have a color
            if (embedData.color && embedData.color.length > 0) {

                // Adds the image to the embed through its builder
                resultData.embeds[0].setColor(embedData.color);
            };

            // If the embed contains an author
            if (embedData.author && embedData.author.name && embedData.author.name.length > 0) {

                // Replaces the author's name for their real values
                embedData.author.name = await client.functions.utils.parseWildcards(embedData.author.name);
            
                // Shortens the content of the author's name if it exceeds the maximum, and stores it in the object of the result  
                embedData.author.name = embedData.author.name.length > 256 ? `${embedData.author.name.slice(0, 252)} ...` : embedData.author.name;

                // Adds the author to the embed through its builder
                resultData.embeds[0].setAuthor({ name: embedData.author.name, iconURL: embedData.author.iconURL || null, url: embedData.author.url || null });
            };

            // If the embed contains a miniature
            if (embedData.thumbnail && embedData.thumbnail.length > 0) {

                // Adds the miniature to the embed through its builder
                resultData.embeds[0].setThumbnail(embedData.thumbnail);
            };

            // If the embed contains a title
            if (embedData.title && embedData.title.length > 0) {

                // Replaces the placeholders of the content of the title for their real values
                embedData.title = await client.functions.utils.parseWildcards(embedData.title);
            
                // Shortens the title content if it exceeds the maximum, and stores it in the result object
                embedData.title = embedData.title.length > 256 ? `${embedData.title.slice(0, 252)} ...` : embedData.title;

                // Adds the title to the embed through its builder
                resultData.embeds[0].setTitle(embedData.title);
            };

            // If the embed contains a URL
            if (embedData.url && embedData.url.length > 0) {

                // Adds the URL to the embed through its builder
                resultData.embeds[0].setURL(embedData.url);
            };

            // If the embed contains a description
            if (embedData.description && embedData.description.length > 0) {

                // Replaces the pleaceholders of the content of the description for their real values
                embedData.description = await client.functions.utils.parseWildcards(embedData.description);
            
                // Shortens the content of the description if it exceeds the maximum, and stores it in the object of the result
                embedData.description = embedData.description.length > 4096 ? `${embedData.description.slice(0, 4092)} ...` : embedData.description;

                // Adds the description to the embed through its builder
                resultData.embeds[0].setDescription(embedData.description);
            };

            // If the embed has fields
            if (embedData.fields && embedData.fields.length > 0) {

                // For each of the fields provided
                for (let fieldNumber = 0; fieldNumber < embedData.fields.length; fieldNumber++) {

                    // Aborts if the number of allowed fields has been exceeded
                    if (fieldNumber > 25) break;

                    // Stores the properties of the iterated field
                    let fieldData = embedData.fields[fieldNumber];

                    // If the field has valid properties
                    if (fieldData.name && fieldData.name.length > 0 && fieldData.value && fieldData.value.length > 0 ) {

                        // Replaces the placeholders of the field name with their real values
                        fieldData.name = await client.functions.utils.parseWildcards(fieldData.name);
                    
                        // Shortens the content of the field name if it exceeds the maximum, and stores it in the object of the result
                        fieldData.name = fieldData.name.length > 256 ? `${fieldData.name.slice(0, 252)} ...` : fieldData.name;

                        // Replaces the placeholders of the value of the field with their real values
                        fieldData.value = await client.functions.utils.parseWildcards(fieldData.value);
                    
                        // Shortens the content of the value of the field if it exceeds the maximum, and stores it in the object of the result   
                        fieldData.value = fieldData.value.length > 1024 ? `${fieldData.value.slice(0, 120)} ...` : fieldData.value;

                        // Adds a field to the embed through its builder
                        resultData.embeds[0].addFields({ name: fieldData.name, value: fieldData.value, inline: fieldData.inline || false });
                    };
                };
            };

            // If the embed contains an image
            if (embedData.image && embedData.image.length > 0) {

                // Adds the image to the embed through its builder
                resultData.embeds[0].setImage(embedData.image);
            };

            // If the embed must have a timestamp
            if (embedData.timestamp === true) {

                // Adds the timestamp to the embed through its builder
                resultData.embeds[0].setTimestamp();
            };

            // If the embed contains a footer
            if (embedData.footer && embedData.footer.length > 0) {

                // Replaces the placeholders of the content of the footer for their real values
                embedData.footer = await client.functions.utils.parseWildcards(embedData.footer);
            
                // Shortens the content of the footer if it exceeds the maximum, and stores it in the object of the result
                embedData.footer = embedData.footer.length > 2048 ? `${embedData.footer.slice(0, 2044)} ...` : assembleData.embed.footer;

                // Adds the footer to the embed through its builder
                resultData.embeds[0].setFooter({ text: embedData.footer });
            };
        };

        // If the message contains rows for actions
        if (assembleData.actionRows && assembleData.actionRows.length > 0) {

            // Generates an array for the components
            resultData.components = [];

            // For each of the rows provided
            for (let rowNumber = 0; rowNumber < assembleData.actionRows.length; rowNumber++) {

                // Aborts if the number of rows allowed has been exceeded
                if (rowNumber > 5) break;

                // Adds a row of actions to the components array
                resultData.components[rowNumber] = new discord.ActionRowBuilder();

                // Stores the buttons for that row
                let rowButtons = assembleData.actionRows[rowNumber].buttons;

                // If the row contains buttons
                if (rowButtons.length > 0) {

                    // For each of the buttons provided
                    for (let buttonNumber = 0; buttonNumber < rowButtons.length; buttonNumber++) {

                        // Aborts if the number of allowed buttons has been overcome
                        if (buttonNumber > 5) break;

                        // Stores the properties of the iterated button
                        let buttonData = rowButtons[buttonNumber];

                        // If the button has valid properties
                        if (buttonData.label && buttonData.label.length > 0 && buttonData.url && buttonData.url.length > 0 ) {

                            // Replaces the placeholders of the button label with their real values
                            buttonData.label = await client.functions.utils.parseWildcards(buttonData.label);
                        
                            // Shortens the content of the button label if it exceeds the maximum, and stores it in the result object
                            buttonData.label = buttonData.label.length > 80 ? `${buttonData.label.slice(0, 76)} ...` : buttonData.label;

                            // If an emoji was provided
                            if (buttonData.emoji) {

                                // Shortens the content of the button's emoji field if it exceeds the maximum
                                buttonData.emoji = buttonData.emoji.length > 2 ? buttonData.emoji.slice(0, 2) : buttonData.emoji;
                
                                // Corrects the emoji field if a valid one was not provided, and stores it in the object object
                                buttonData.emoji = /\p{Extended_Pictographic}/u.test(buttonData.emoji) ? buttonData.emoji : '🔗';
                            };

                            // Generates a new button using its builder
                            let button = new discord.ButtonBuilder()
                                .setLabel(buttonData.label)
                                .setStyle(discord.ButtonStyle.Link)
                                .setURL(buttonData.url)

                            // If an emoji has been provided, adds it to the button
                            if (buttonData.emoji) button.setEmoji(buttonData.emoji);

                            // Loads the button in the corresponding row
                            resultData.components[rowNumber].addComponents(button);
                        };
                    };
                };
            };
        };

        // Returns the result
        return resultData;

    } catch (error) {

        // Shows an error through the console
        logger.error(error.stack);

        // Returns an erroneous state
        return false;
    };
};
