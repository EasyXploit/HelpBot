//Función para generar mensajes y embeds a partir de un objeto estructurado
module.exports = async (assembleData) => {

    try {

        //Almacena el resultado final
        let resultData = {};

        //Si el mensaje contiene un contenido (sin embed)
        if (assembleData.content && assembleData.content.length > 0) {

            //Sustituye los placeholders del contenido del mensaje por sus valores reales
            assembleData.content = await client.functions.utilities.parseWildcards(assembleData.content);
        
            //Acorta el contenido del mensaje si excede el máximo, y lo almacena en el objeto de resultado
            resultData.content = assembleData.content.length > 4096 ? `${assembleData.content.slice(0, 4092)} ...` : assembleData.content;
        };

        //Si el mensaje contiene un embed
        if (assembleData.embed) {

            //Genera un embed al que añadirle propiedades
            resultData.embeds = [ new client.MessageEmbed() ];

            //Almacena las propiedades del embed
            let embedData = assembleData.embed;

            //Si el embed debe tener un color
            if (embedData.color && embedData.color.length > 0) {

                //Añade la imagen al embed mediante su constructor
                resultData.embeds[0].setColor(embedData.color);
            };

            //Si el embed contiene un author
            if (embedData.author && embedData.author.name && embedData.author.name.length > 0) {

                //Sustituye los placeholders del nombre del autor por sus valores reales
                embedData.author.name = await client.functions.utilities.parseWildcards(embedData.author.name);
            
                //Acorta el contenido del nombre del autor si excede el máximo, y lo almacena en el objeto de resultado
                embedData.author.name = embedData.author.name.length > 256 ? `${embedData.author.name.slice(0, 252)} ...` : embedData.author.name;

                //Añade el autor al embed mediante su constructor
                resultData.embeds[0].setAuthor({ name: embedData.author.name, iconURL: embedData.author.iconURL || null, url: embedData.author.url || null });
            };

            //Si el embed contiene una miniatura
            if (embedData.thumbnail && embedData.thumbnail.length > 0) {

                //Añade la miniatura al embed mediante su constructor
                resultData.embeds[0].setThumbnail(embedData.thumbnail);
            };

            //Si el embed contiene un título
            if (embedData.title && embedData.title.length > 0) {

                //Sustituye los placeholders del contenido del título por sus valores reales
                embedData.title = await client.functions.utilities.parseWildcards(embedData.title);
            
                //Acorta el contenido del título si excede el máximo, y lo almacena en el objeto de resultado
                embedData.title = embedData.title.length > 256 ? `${embedData.title.slice(0, 252)} ...` : embedData.title;

                //Añade el título al embed mediante su constructor
                resultData.embeds[0].setTitle(embedData.title);
            };

            //Si el embed contiene una URL
            if (embedData.url && embedData.url.length > 0) {

                //Añade la URL al embed mediante su constructor
                resultData.embeds[0].setURL(embedData.url);
            };

            //Si el embed contiene una descripción
            if (embedData.description && embedData.description.length > 0) {

                //Sustituye los placeholders del contenido de la descripción por sus valores reales
                embedData.description = await client.functions.utilities.parseWildcards(embedData.description);
            
                //Acorta el contenido de la descripción si excede el máximo, y lo almacena en el objeto de resultado
                embedData.description = embedData.description.length > 4096 ? `${embedData.description.slice(0, 4092)} ...` : embedData.description;

                //Añade la descripción al embed mediante su constructor
                resultData.embeds[0].setDescription(embedData.description);
            };

            //Si el embed tiene campos
            if (embedData.fields && embedData.fields.length > 0) {

                //Por cada uno de los campos proporcionados
                for (let fieldNumber = 0; fieldNumber < embedData.fields.length; fieldNumber++) {

                    //Aborta si se ha superado el número de campos permitidos
                    if (fieldNumber > 25) break;

                    //Almacena las propiedades del campo iterado
                    let fieldData = embedData.fields[fieldNumber];

                    //Si el campo tiene propiedades válidas
                    if (fieldData.name && fieldData.name.length > 0 && fieldData.value && fieldData.value.length > 0 ) {

                        //Sustituye los comodines del nombre del campo por sus valores reales
                        fieldData.name = await client.functions.utilities.parseWildcards(fieldData.name);
                    
                        //Acorta el contenido del nombre del campo si excede el máximo, y lo almacena en el objeto de resultado
                        fieldData.name = fieldData.name.length > 256 ? `${fieldData.name.slice(0, 252)} ...` : fieldData.name;

                        //Sustituye los comodines del valor del campo por sus valores reales
                        fieldData.value = await client.functions.utilities.parseWildcards(fieldData.value);
                    
                        //Acorta el contenido del valor del campo si excede el máximo, y lo almacena en el objeto de resultado
                        fieldData.value = fieldData.value.length > 1024 ? `${fieldData.value.slice(0, 120)} ...` : fieldData.value;

                        //Añade un campo al embed mediante su constructor
                        resultData.embeds[0].addFields({ name: fieldData.name, value: fieldData.value, inline: fieldData.inline || false });
                    };
                };
            };

            //Si el embed contiene una imagen
            if (embedData.image && embedData.image.length > 0) {

                //Añade la imagen al embed mediante su constructor
                resultData.embeds[0].setImage(embedData.image);
            };

            //Si el embed debe tener una marca de tiempo
            if (embedData.timestamp === true) {

                //Añade la marca de tiempo al embed mediante su constructor
                resultData.embeds[0].setTimestamp();
            };

            //Si el embed contiene un pie
            if (embedData.footer && embedData.footer.length > 0) {

                //Sustituye los placeholders del contenido del pie por sus valores reales
                embedData.footer = await client.functions.utilities.parseWildcards(embedData.footer);
            
                //Acorta el contenido del pie si excede el máximo, y lo almacena en el objeto de resultado
                embedData.footer = embedData.footer.length > 2048 ? `${embedData.footer.slice(0, 2044)} ...` : assembleData.embed.footer;

                //Añade el pie al embed mediante su constructor
                resultData.embeds[0].setFooter(embedData.footer);
            };
        };

        //Si el mensaje contiene filas para acciones
        if (assembleData.actionRows && assembleData.actionRows.length > 0) {

            //Genera un array para los componentes
            resultData.components = [];

            //Por cada una de las filas proporcionadas
            for (let rowNumber = 0; rowNumber < assembleData.actionRows.length; rowNumber++) {

                //Aborta si se ha superado el número de filas permitidass
                if (rowNumber > 5) break;

                //Añade una fila de acciones al array de componentes
                resultData.components[rowNumber] = new client.MessageActionRow();

                //Almacena los botones para esa fila
                let rowButtons = assembleData.actionRows[rowNumber].buttons;

                //Si la fila contiene botones
                if (rowButtons.length > 0) {

                    //Por cada uno de los botones proporcionados
                    for (let buttonNumber = 0; buttonNumber < rowButtons.length; buttonNumber++) {

                        //Aborta si se ha superado el número de botones permitidos
                        if (buttonNumber > 5) break;

                        //Almacena las propiedades del botón iterado
                        let buttonData = rowButtons[buttonNumber];

                        //Si el botón tiene propiedades válidas
                        if (buttonData.label && buttonData.label.length > 0 && buttonData.url && buttonData.url.length > 0 ) {

                            //Sustituye los comodines de la etiqueta del botón por sus valores reales
                            buttonData.label = await client.functions.utilities.parseWildcards(buttonData.label);
                        
                            //Acorta el contenido de la etiqueta del botón si excede el máximo, y lo almacena en el objeto de resultado
                            buttonData.label = buttonData.label.length > 80 ? `${buttonData.label.slice(0, 76)} ...` : buttonData.label;

                            //Si se proporcionó un emoji
                            if (buttonData.emoji) {

                                //Acorta el contenido del campo de emoji del botón si excede el máximo
                                buttonData.emoji = buttonData.emoji.length > 2 ? buttonData.emoji.slice(0, 2) : buttonData.emoji;
                
                                //Corrige el campo de emoji si no se proporcionó uno válido, y lo almacena en el objeto de resultado
                                buttonData.emoji = /\p{Extended_Pictographic}/u.test(buttonData.emoji) ? buttonData.emoji : '🔗';
                            };

                            //Genera un nuevo botón mediante su constructor
                            let button = new client.MessageButton()
                                .setLabel(buttonData.label)
                                .setStyle('LINK')
                                .setURL(buttonData.url)

                            //Si se ha proporcionado un emoji, lo añade al botón
                            if (buttonData.emoji) button.setEmoji(buttonData.emoji);

                            //Carga el botón en la fila correspondiente
                            resultData.components[rowNumber].addComponents(button);
                        };
                    };
                };
            };
        };

        //Devuelve el resultado
        return resultData;

    } catch (error) {

        //Muestra un error por consola
        logger.error(error.stack);

        //Devuelve un estado erróneo
        return false;
    };
};
