import guppy from '../../public/fotos-prueba/guppy.webp';
import simba from '../../public/fotos-prueba/simba.webp';
import luna from '../../public/fotos-prueba/luna.webp';
import nala from '../../public/fotos-prueba/nala.webp';
import rex from '../../public/fotos-prueba/rex.webp';
import max from '../../public/fotos-prueba/max.webp';
import mia from '../../public/fotos-prueba/mia.webp';
import toby from '../../public/fotos-prueba/toby.webp';
import cleo from '../../public/fotos-prueba/cleo.webp';

export interface Animal {
    id: string;
    name: string;
    age: string;
    description: string;
    /** Hoy es un archivo local; con el backend será la URL de la foto. */
    image: string;
}

export const animals: Animal[] = [
    { id: 'guppy', name: 'Guppy', age: '3 años', description: 'Sociable y enérgico', image: guppy },
    { id: 'simba', name: 'Simba', age: '1 año', description: 'Curioso y tranquilo', image: simba },
    { id: 'luna', name: 'Luna', age: '2 años', description: 'Cariñosa y juguetona', image: luna },
    { id: 'nala', name: 'Nala', age: '2 años', description: 'Dulce y calmada', image: nala },
    { id: 'rex', name: 'Rex', age: '4 años', description: 'Leal y cariñoso', image: rex },
    { id: 'max', name: 'Max', age: '2 años', description: 'Activo y protector', image: max },
    { id: 'mia', name: 'Mía', age: '1 año', description: 'Tímida y tierna', image: mia },
    { id: 'toby', name: 'Toby', age: '5 años', description: 'Tranquilo y fiel', image: toby },
    { id: 'cleo', name: 'Cleo', age: '3 años', description: 'Independiente y curiosa', image: cleo },
];