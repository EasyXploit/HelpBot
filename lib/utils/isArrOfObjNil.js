// Function to delete undefined or null keys from an array of objects
const isArrOfObjNil = async (array, lodash) => {

    // Requires "lodash" to compare objects
    lodash ? lodash : require('lodash');

    // Stores an array for the modified objects
    let cleanArray = [];

    // For each of the array objects
    for (let object of array) {

        // For each of the properties of the iterated object
        for (let property in object) {

            // If the property is an array and has values
            if (Array.isArray(object[property]) && object[property].length > 0) {
                
                // Executes this same function recursively on said array
                object[property] = await isArrOfObjNil(object[property], lodash);
            }
        };

        // Removes the null or undefined keys of the property and adds it to the array of modified objects
        cleanArray.push(lodash.omitBy(object, lodash.isNil));
    };

    // Returns the new array
    return cleanArray;
};

// Exports the function
export default isArrOfObjNil;
