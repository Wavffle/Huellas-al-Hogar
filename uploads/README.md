```
 _  _          _ _                _   _  _
| || |_  _ ___| | |__ _ ___  __ _| | | || |___  __ _ __ _ _ _
| __ | || / -_) | / _` (_-< / _` | | | __ / _ \/ _` / _` | '_|
|_||_|\_,_\___|_|_\__,_/__/ \__,_|_| |_||_\___/\__, \__,_|_|
                                               |___/

    /\_/\                                           __      _
   ( o.o )                                         o'')}____//
    > ^ <                                           `_/      )
                                                    (_(_/-(_/
```

# Carpeta `uploads/`

Aquí se guardan las fotos de los animales: las imágenes que sube quien publica un animal en Huellas al Hogar. El servidor las recibe, las revisa y las deja en esta carpeta; la base de datos solo guarda su ruta (`/uploads/<archivo>`).

| Regla | Valor |
|---|---|
| Formatos | JPG, PNG o WebP |
| Peso | Hasta 5 MB cada una |
| Cantidad | De 1 a 5 por animal |
| Verificación | Se comprueba el contenido real del archivo (sus primeros bytes), no solo el tipo que declare el navegador. Si una foto no es una imagen válida, no se guarda ninguna de esa petición. |

## Cómo se nombran

El servidor les pone un nombre propio, sin usar el original:

```
<marca de tiempo>-<identificador único>.<extensión>
1792825373781-2a5a4757-def7-43b2-8770-1d68f8b80388.jpg
```

Así dos fotos nunca chocan, aunque se llamen igual. La extensión corresponde al contenido real de la imagen.

## Cuándo se borran

- Al eliminar un animal, se borran también sus fotos.
- Al quitar una foto en la edición de un animal.
- Si una publicación falla a mitad de camino, las fotos recibidas en esa petición se descartan.