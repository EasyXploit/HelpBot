// Function to shorten a text to a maximum length, adding an ellipsis if it is shortened
export default (text, maxLength) => {

    // Converts the value to a string
    text = `${text}`;

    // Returns the text as it is if it does not exceed the maximum length, or shortened with an ellipsis
    return text.length > maxLength ? `${text.slice(0, maxLength - 4)} ...` : text;
};
