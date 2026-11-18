#!/bin/sh
# Inicializa las carpetas montadas como volumen y arranca la aplicación
set -e

# Copia los archivos por defecto que falten en configs y storage, sin sobrescribir los existentes
for dir in configs storage; do
    (cd "/app/defaults/$dir" && find . -type f) | while read -r file; do
        if [ ! -e "/app/$dir/$file" ]; then
            mkdir -p "$(dirname "/app/$dir/$file")"
            cp "/app/defaults/$dir/$file" "/app/$dir/$file"
            echo "Copied default file: $dir/${file#./}"
        fi
    done
done

# Ejecuta el comando del contenedor (CMD)
exec "$@"