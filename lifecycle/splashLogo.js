exports.run = (locale) => {

    //Dependencia para generar arte ASCII
    const logo = require('asciiart-logo');

    //Carga la configuración del repositorio
    const packageConfig = require('../package.json');

    //Muestra el arte ASCII
    logger.info(
        logo({
            name: packageConfig.normalizedName,
            font: 'Speed',
            lineChars: 15,
            padding: 5,
            margin: 2
        })
        .emptyLine()
        .right(`V. ${packageConfig.version}`)
        .emptyLine()
        .wrap(locale.description)
        .render(),
        '\n'
    );
};
