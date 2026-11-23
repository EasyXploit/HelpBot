// Stores the configuration documents loaded in memory (or being loaded), by their name
const loadedConfigs = {};

// Function to convert a configuration document to a plain object, to read its values
function toPlainObject(configDoc) {
    return configDoc.toObject({ flattenMaps: true });
};

// Function to obtain a configuration document from memory, loading it from the database (or generating it) the first time it is requested
// Returns an entry with the document, a plain copy of it to read its values, and the queue of its pending writes (or null if it could not be loaded)
export default async (configName) => {

    // If the document is not loaded or being loaded
    if (!loadedConfigs[configName]) {

        // Stores the load of the document, so it is only loaded once when it is requested several times at once
        loadedConfigs[configName] = (async () => {

            // Imports the corresponding script to the required model
            const ConfigModel = (await import(`../../models/config/${configName}.js`)).default;

            // Looks for the configuration document by its model and name, or generates it if it does not exist
            const configDoc = await ConfigModel.findOne({ docType: configName }).exec() || await (await import('./genConfig.js')).default(configName);

            // If the document could not be loaded nor generated, throws an error (so it is tried again the next time)
            if (!configDoc) throw new Error(`The configuration document "${configName}" could not be loaded`);

            // Returns the entry of the document
            return { model: ConfigModel, doc: configDoc, plain: toPlainObject(configDoc), writes: Promise.resolve() };
        })();

        // If the document could not be loaded, forgets the load, so it is tried again the next time
        loadedConfigs[configName].catch(() => delete loadedConfigs[configName]);
    };

    // Returns the entry of the document
    return await loadedConfigs[configName];
};

// Function to change a value of a configuration document and save it, one write after another (as a document can not be saved twice at once)
// Returns the new value, or null if the key does not exist in the document
export async function writeConfig(configName, keys, newValue) {

    // Stores the entry of the document
    const entry = await loadedConfigs[configName];

    // Adds the write to the queue of the document
    const write = entry.writes.then(async () => {

        // Stores the iterated step
        let step = entry.doc;

        // For each of the keys of the route, returns null if it does not exist
        for (const key of keys) {
            if (typeof step === 'object' && step !== null && key in step) step = step[key];
            else return null;
        };

        try {

            // Changes the value of the key provided, and saves the document with the changes
            entry.doc.set(keys.join('.'), newValue);
            await entry.doc.save();

        } catch (error) {

            // Reloads the document from the database, so the memory does not keep a change that was not saved (or forgets it, if it can not be reloaded)
            try {
                entry.doc = await entry.model.findOne({ docType: configName }).exec();
                entry.plain = toPlainObject(entry.doc);
            } catch (reloadError) {
                delete loadedConfigs[configName];
            };

            // Throws the error of the write
            throw error;
        };

        // Updates the plain copy of the document
        entry.plain = toPlainObject(entry.doc);

        // Returns the new value
        return newValue;
    });

    // Keeps the queue going, even if this write fails
    entry.writes = write.catch(() => {});

    // Returns the result of the write
    return await write;
};
