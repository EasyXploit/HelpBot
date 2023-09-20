// Function to convert magnitudes to milliseconds
export default async duration => {

    // Stores the result
    let result = 0;

    // Function to separate parts of magnitudes and calculate milliseconds
    async function parseMillis(magnitude) {

        // Obtains the magnitude of time
        const time = magnitude.slice(0, -1);

        // Gets the unit of measure
        const measure = magnitude.slice(-1).toLowerCase();

        // Checks if a number has been provided
        if (isNaN(time)) return false;

        // Checks if a valid unit of measure has been provided
        if (measure !== 's' && measure !== 'm' && measure !== 'h' && measure !== 'd') return false;

        // Stores the resulting milliseconds
        let milliseconds;

        // Transforms to milliseconds according to the measure
        switch (measure) {
            case 's': milliseconds = time * 1000;       break;
            case 'm': milliseconds = time * 60000;      break;
            case 'h': milliseconds = time * 3600000;    break;
            case 'd': milliseconds = time * 86400000;   break;
        };

        // Returns the result
        return milliseconds;
    };

    // Checks if an array has been provided or not
    if (Array.isArray(duration)) {
        
        // For each array parameter
        for (const parameter of duration) {

            // Makes it milliseconds
            const parsedMillis = await parseMillis(parameter);

            // If a result was obtained, adds it
            if (parsedMillis) result += parsedMillis;
        };

    } else {

        // Makes it milliseconds
        const parsedMillis = await parseMillis(duration);

        // If a result was obtained, adds it
        if (parsedMillis) result += parsedMillis;
    };

    // If a result was calculated, it returns it
    if (result > 0) return result;
};