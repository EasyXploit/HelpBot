// Function to generate a data document in the database
export default async (dataType, newData) => {

    try {

        // Imports the corresponding script to the required model
        const DataModel = await import(`../../models/data/${dataType}.js`);

        // Generates a new document for this data
        let newDataDoc = new DataModel.default();

        // For each of the initialization data
        for (const key in newData) {

            // Checks if can add it to the document
            if (Object.hasOwnProperty.call(newData, key)) {

                // Adds it to the document
                newDataDoc.set(key, newData[key]);
            };
        };
    
        // Returns the already saved document
        return newDataDoc.save();

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
