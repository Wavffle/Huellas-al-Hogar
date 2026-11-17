import { describe, expect, it } from 'vitest';
import type { AdoptionAnimal } from '../../data/adoptions';
import { EMPTY_FILTERS, filterAnimals, formatAge, getAgeGroup, sortAnimals } from './adoptionUtils';

const animal = (over: Partial<AdoptionAnimal>): AdoptionAnimal => ({
    id: '1',
    name: 'Luna',
    species: 'gato',
    ageMonths: 24,
    size: 'pequeño',
    sex: 'hembra',
    city: 'Valparaíso',
    image: '',
    ...over,
});

const LISTA = [
    animal({ id: '1', name: 'Luna', species: 'gato', ageMonths: 24, city: 'Valparaíso' }),
    animal({ id: '2', name: 'Simón', species: 'perro', ageMonths: 6, size: 'grande', sex: 'macho', city: 'Santiago' }),
    animal({ id: '3', name: 'Ámbar', species: 'perro', ageMonths: 120, size: 'mediano', sex: 'hembra', city: 'Valparaíso' }),
];

describe('formatAge y getAgeGroup', () => {
    it('muestra meses o años según corresponda', () => {
        expect(formatAge(1)).toBe('1 Mes');
        expect(formatAge(6)).toBe('6 Meses');
        expect(formatAge(12)).toBe('1 Año');
        expect(formatAge(30)).toBe('2 Años');
    });

    it('clasifica por grupo de edad en los límites', () => {
        expect(getAgeGroup(11)).toBe('cachorro');
        expect(getAgeGroup(12)).toBe('adulto');
        expect(getAgeGroup(84)).toBe('adulto');
        expect(getAgeGroup(85)).toBe('senior');
    });
});

describe('filterAnimals', () => {
    it('sin filtros devuelve todos los animales', () => {
        expect(filterAnimals(LISTA, EMPTY_FILTERS)).toHaveLength(3);
    });

    it('filtra por especie', () => {
        const r = filterAnimals(LISTA, { ...EMPTY_FILTERS, species: ['perro'] });
        expect(r.map((a) => a.name)).toEqual(['Simón', 'Ámbar']);
    });

    it('combina filtros (todos deben cumplirse)', () => {
        const r = filterAnimals(LISTA, { ...EMPTY_FILTERS, species: ['perro'], city: 'Valparaíso' });
        expect(r.map((a) => a.name)).toEqual(['Ámbar']);
    });

    it('filtra por grupo de edad y por sexo', () => {
        expect(filterAnimals(LISTA, { ...EMPTY_FILTERS, ages: ['cachorro'] }).map((a) => a.name)).toEqual(['Simón']);
        expect(filterAnimals(LISTA, { ...EMPTY_FILTERS, sexes: ['hembra'] })).toHaveLength(2);
    });

    it('la búsqueda por nombre ignora mayúsculas y tildes', () => {
        expect(filterAnimals(LISTA, { ...EMPTY_FILTERS, search: 'simon' }).map((a) => a.name)).toEqual(['Simón']);
        expect(filterAnimals(LISTA, { ...EMPTY_FILTERS, search: 'AMBAR' }).map((a) => a.name)).toEqual(['Ámbar']);
    });

    it('si nada coincide, devuelve una lista vacía', () => {
        expect(filterAnimals(LISTA, { ...EMPTY_FILTERS, species: ['otro'] })).toEqual([]);
    });
});

describe('sortAnimals', () => {
    it('"recientes" conserva el orden recibido', () => {
        expect(sortAnimals(LISTA, 'recientes').map((a) => a.id)).toEqual(['1', '2', '3']);
    });

    it('ordena por nombre, menor edad y mayor edad', () => {
        expect(sortAnimals(LISTA, 'nombre').map((a) => a.name)).toEqual(['Ámbar', 'Luna', 'Simón']);
        expect(sortAnimals(LISTA, 'menor-edad').map((a) => a.id)).toEqual(['2', '1', '3']);
        expect(sortAnimals(LISTA, 'mayor-edad').map((a) => a.id)).toEqual(['3', '1', '2']);
    });

    it('no modifica la lista original', () => {
        sortAnimals(LISTA, 'nombre');
        expect(LISTA.map((a) => a.id)).toEqual(['1', '2', '3']);
    });
});