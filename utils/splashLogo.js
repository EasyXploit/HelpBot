const logo = require('asciiart-logo');
const packageConfig = require('../package.json');

module.exports = {
    splash: logo({
        name: packageConfig.normalizedName,
        font: 'Speed',
        lineChars: 15,
        padding: 5,
        margin: 2
    })
    .emptyLine()
    .right(`V. ${packageConfig.version}`)
    .emptyLine()
    .wrap(packageConfig.description)
    .render(),
    divider: `\n》Iniciando aplicación «\n―――――――――――――――――――――――― \n${new Date().toLocaleString()}\n`
};
