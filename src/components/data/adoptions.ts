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
    /** URL de la foto de portada (viene del backend). */
    image: string;
}