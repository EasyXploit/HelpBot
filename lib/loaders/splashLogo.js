// Exports a function to show a logo
export async function splashLogo(locale) {

    // Dependency to generate ASCII arts
    const logo = require('asciiart-logo');

    // Loads the repository configuration
    const packageConfig = require('./package.json');

    // Shows the ASCII art
    console.info(
        logo({
            name: packageConfig.normalizedName,
            font: 'Speed',
            lineChars: 15,
            padding: 5,
            margin: 2
        })
        .emptyLine()
        .right(`v${packageConfig.version}`)
        .emptyLine()
        .wrap(locale.description)
        .render(),
        '\n'
    );
};
