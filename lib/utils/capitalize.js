// Function to capitalize a text string
export default (string) => {

    // Converts the string to lowercase and separates it by scripts into an array
    let wordsArray = string.toLowerCase().split('_');

    // Obtains the result by means of a map
    let returnString = wordsArray.map((word) => {

        // Returns each word with the first letter in capital letters
        return word.charAt(0).toUpperCase() + word.slice(1);

    }).join(' ');

    // Returns the result
    return returnString;
};
  