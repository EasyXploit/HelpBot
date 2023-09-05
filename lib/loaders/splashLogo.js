//Exporta una función para mostrar un logo
export async function splashLogo(locale) {

    //Dependencia para generar arte ASCII
    const logo = require('asciiart-logo');

    //Carga la configuración del repositorio
    const packageConfig = require('./package.json');

    //Limpia la consola completamente
    process.stdout.write('\u001b[2J\u001b[0;0H');

    //Muestra el arte ASCII
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
