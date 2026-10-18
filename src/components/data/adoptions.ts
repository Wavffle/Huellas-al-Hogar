import guppy from '../../assets/images/animals/guppy.webp';
import simba from '../../assets/images/animals/simba.webp';
import luna from '../../assets/images/animals/luna.webp';
import nala from '../../assets/images/animals/nala.webp';
import rex from '../../assets/images/animals/rex.webp';
import max from '../../assets/images/animals/max.webp';
import mia from '../../assets/images/animals/mia.webp';
import toby from '../../assets/images/animals/toby.webp';
import cleo from '../../assets/images/animals/cleo.webp';

export type Species = 'perro' | 'gato';
export type AgeGroup = 'cachorro' | 'adulto' | 'senior';
export type Size = 'pequeño' | 'mediano' | 'grande';
export type Sex = 'macho' | 'hembra';

export interface AdoptionAnimal {
    id: string;
    name: string;
    species: Species;
    /** Edad en meses; se muestra como "Meses" o "Años" según corresponda. */
    ageMonths: number;
    size: Size;
    sex: Sex;
    city: string;
    /** Hoy es un archivo local; con el backend será la URL de la foto. */
    image: string;
}

// Orden = "más recientes" primero. Datos de prueba.
const base: AdoptionAnimal[] = [
    { id: 'luna', name: 'Luna', species: 'perro', ageMonths: 5, size: 'mediano', sex: 'hembra', city: 'Santiago', image: luna },
    { id: 'simba', name: 'Simba', species: 'perro', ageMonths: 12, size: 'mediano', sex: 'macho', city: 'Viña del Mar', image: simba },
    { id: 'max', name: 'Max', species: 'perro', ageMonths: 36, size: 'grande', sex: 'macho', city: 'Concepción', image: max },
    { id: 'nala', name: 'Nala', species: 'gato', ageMonths: 24, size: 'pequeño', sex: 'hembra', city: 'Santiago', image: nala },
    { id: 'guppy', name: 'Guppy', species: 'gato', ageMonths: 36, size: 'mediano', sex: 'macho', city: 'Valparaíso', image: guppy },
    { id: 'mia', name: 'Mía', species: 'gato', ageMonths: 14, size: 'pequeño', sex: 'hembra', city: 'Villa Alemana', image: mia },
    { id: 'toby', name: 'Toby', species: 'perro', ageMonths: 48, size: 'grande', sex: 'macho', city: 'Temuco', image: toby },
    { id: 'cleo', name: 'Cleo', species: 'gato', ageMonths: 40, size: 'pequeño', sex: 'hembra', city: 'Valparaíso', image: cleo },
    { id: 'rex', name: 'Rex', species: 'perro', ageMonths: 96, size: 'grande', sex: 'macho', city: 'Santiago', image: rex },
];

// TEMPORAL: repite los 9 animales 3 veces (27) solo para probar la paginación.
// Borrar al conectar el backend.
const REPEATS = 4;
export const adoptions: AdoptionAnimal[] = Array.from({ length: REPEATS }, (_, i) =>
    base.map((a) => (i === 0 ? a : { ...a, id: `${a.id}-${i + 1}` })),
).flat();