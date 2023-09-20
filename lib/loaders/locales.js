// Exports a function that preloads the language of the bot
export async function loadLocales(desiredLocaleName) {

    // Stores the default language translations
    const defaultLocale = JSON.parse(fs.readFileSync('./locales/en-US.json'));

    // Stores the translations to the configured language
    const desiredLocale = JSON.parse(fs.readFileSync(`./locales/${desiredLocaleName}.json`));

    // If the default language is the same as the desired one, returns this same
    if (desiredLocaleName.toLowerCase() === 'en-US') return desiredLocale;

    // Function to merge objects that differ
    function mergeObject(object1, object2) {

        // For each of the keys of the object 1
        Object.keys(object1).forEach(key => {

            // If the key contains an object
            if (typeof object1[key] === 'object') {

                // If the key does not exist in the second object, it is added
                if (!object2.hasOwnProperty(key)) object2[key] = object1[key];

                // If not, lowers a level and invokes this function again
                else mergeObject(object1[key], object2[key]);

            } else {

                // If the key does not exist in the second object
                if (!object2.hasOwnProperty(key)) {

                    // Adds it
                    object2[key] = object1[key];

                } else {

                    // If it exists and its value has a wild card
                    if (object1[key].includes('{{') && object1[key].includes('}}')) {

                        // Stores the name of the wild card
                        const wildcardName = object1[key].match(/{{(\w+)}}/)[1];

                        // If the second object does not have the wild card
                        if (!object2[key].includes(`{{${wildcardName}}}`)) {

                            // Replaces the value of the second object with the value of the first
                            object2[key] = object1[key];
                        };
                    };
                };
            };
        });

        // For each of the keys of the object 2
        Object.keys(object2).forEach(key => {

            // If the key does not exist in the first object, deletes it from the second one
            if (!object1.hasOwnProperty(key)) delete object2[key];
        });
      
        // For each of the keys of the object 1, if its value includes a wild card (and is not an object)
        Object.keys(object2).filter(key => typeof object2[key] === 'string' && object2[key].includes('{{')).forEach(key => {

            // If the value has a wild card
            if (object2[key].includes('{{') && object2[key].includes('}}')) {

                // Stores the name of the wild card
                const wildcardName = object2[key].match(/{{(\w+)}}/)[1];

                // If the first object does not have the wild card
                if (!object1[key].includes(`{{${wildcardName}}}`)) {

                    // Replaces the value of the second object with the value of the first
                    object2[key] = object1[key];
                };
            };
        });
      
        // Returns the resulting object
        return object2;
    };
    
    // Merges translations into a single one
    const mergedLocale = mergeObject(defaultLocale, desiredLocale);

    // Returns the new translations
    return mergedLocale;
};
