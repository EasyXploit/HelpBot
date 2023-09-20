// Function to replace placeholders in translations
export default async (expression, valuesObject) => {

    // Stores the text, with the expression's wildcards replaced
    const text = expression.replace(new RegExp(/{{\s?([^{}\s]*)\s?}}/g), (substring, value, index) => {

        // Stores the replaced value
        value = valuesObject[value];

        // Returns the value
        return value;
    });

    // Returns the replaced text
    return text;
};