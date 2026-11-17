import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdoptionAnimal } from '../data/adoptions';
import { getAnimales } from '../services/animalService';
import { EMPTY_FILTERS, type Filters } from '../components/adoptions/adoptionUtils';
import AdoptionsPage from './AdoptionsPage';

vi.mock('../services/animalService', () => ({ getAnimales: vi.fn() }));
vi.mock('../components/adoptions/adoptionMapper', () => ({ mapAnimal: (a: unknown) => a }));
vi.mock('../components/adoptions/AdoptionsHero', () => ({ default: () => null }));
vi.mock('../components/adoptions/Pagination', () => ({ default: () => null }));
vi.mock('../components/common/PawLoader', () => ({ default: () => <p>Cargando</p> }));
vi.mock('../components/adoptions/AdoptionCard', () => ({
    default: ({ animal }: { animal: AdoptionAnimal }) => <span>{animal.name}</span>,
}));
vi.mock('../components/adoptions/AdoptionFilters', () => ({
    default: ({
                  filters,
                  onChange,
                  onClear,
              }: {
        filters: Filters;
        onChange: (f: Filters) => void;
        onClear: () => void;
    }) => (
        <div>
            <span data-testid="especies">{filters.species.join(',')}</span>
            <span data-testid="ciudad">{filters.city}</span>
            <button onClick={() => onChange({ ...filters, species: ['perro'] })}>elegir perro</button>
            <button onClick={onClear}>limpiar</button>
        </div>
    ),
}));
vi.mock('@ionic/react', () => ({
    IonContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    IonIcon: () => null,
    IonModal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
        isOpen ? <div>{children}</div> : null,
}));

const FILTERS_KEY = 'huellas.adopciones.filtros';
const SORT_KEY = 'huellas.adopciones.orden';

const ANIMALES: AdoptionAnimal[] = [
    { id: '1', name: 'Luna', species: 'gato', ageMonths: 24, size: 'pequeño', sex: 'hembra', city: 'Valparaíso', image: '' },
    { id: '2', name: 'Simón', species: 'perro', ageMonths: 6, size: 'grande', sex: 'macho', city: 'Santiago', image: '' },
];

const getAnimalesMock = vi.mocked(getAnimales);

/** Monta la página y espera a que termine de cargar el catálogo. */
const montar = async () => {
    render(<AdoptionsPage />);
    await screen.findByText(/esperándote/);
};

beforeEach(() => {
    localStorage.clear();
    getAnimalesMock.mockReset();
    getAnimalesMock.mockResolvedValue(ANIMALES as never);
});

describe('AdoptionsPage: filtros y orden guardados (RF-11)', () => {
    it('guarda los filtros y el orden cuando cambian', async () => {
        await montar();

        fireEvent.click(screen.getByText('elegir perro'));
        fireEvent.change(screen.getByRole('combobox', { name: 'Ordenar por' }), { target: { value: 'nombre' } });

        expect(JSON.parse(localStorage.getItem(FILTERS_KEY)!).species).toEqual(['perro']);
        expect(localStorage.getItem(SORT_KEY)).toBe('nombre');
    });

    it('no guarda el texto de búsqueda', async () => {
        await montar();

        fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar por nombre' }), { target: { value: 'Lu' } });

        expect(JSON.parse(localStorage.getItem(FILTERS_KEY)!).search).toBe('');
    });

    it('restaura los filtros y el orden guardados al volver al catálogo', async () => {
        localStorage.setItem(
            FILTERS_KEY,
            JSON.stringify({ ...EMPTY_FILTERS, species: ['gato'], city: 'Valparaíso', search: 'texto' }),
        );
        localStorage.setItem(SORT_KEY, 'menor-edad');

        await montar();

        expect(screen.getByTestId('especies').textContent).toBe('gato');
        expect(screen.getByTestId('ciudad').textContent).toBe('Valparaíso');
        expect((screen.getByRole('combobox', { name: 'Ordenar por' }) as HTMLSelectElement).value).toBe('menor-edad');
        expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(''); // la búsqueda no se restaura
    });

    it('ignora valores guardados corruptos o inválidos', async () => {
        localStorage.setItem(FILTERS_KEY, '{esto no es json');
        localStorage.setItem(SORT_KEY, 'orden-inventado');

        await montar();

        expect(screen.getByTestId('especies').textContent).toBe('');
        expect((screen.getByRole('combobox', { name: 'Ordenar por' }) as HTMLSelectElement).value).toBe('recientes');
    });

    it('quita la ciudad guardada si ya no tiene animales', async () => {
        localStorage.setItem(FILTERS_KEY, JSON.stringify({ ...EMPTY_FILTERS, city: 'Atlantis' }));

        render(<AdoptionsPage />);

        await waitFor(() => expect(screen.getByTestId('ciudad').textContent).toBe(''));
    });
});