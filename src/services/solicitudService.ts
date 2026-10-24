import apiClient, { apiError } from './apiClient';

export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface NuevaSolicitud {
    animal_id: number;
    tipo_vivienda: string;
    tiene_patio: boolean;
    con_quien_convive: string;
    tuvo_mascotas: boolean;
    tiene_mascotas: boolean;
    experiencia: string;
    motivo: string;
    acepta_compromiso: boolean;
    telefono: string;
    ciudad: string;
}

/** Lo que devuelve GET /api/solicitudes (solicitud + postulante + animal). */
export interface Solicitud {
    id: number;
    estado: EstadoSolicitud;
    creado_en: string;
    usuario_id: number;
    animal_id: number;
    tipo_vivienda: string;
    tiene_patio: boolean;
    con_quien_convive: string;
    tuvo_mascotas: boolean;
    tiene_mascotas: boolean;
    experiencia: string | null;
    motivo: string;
    telefono: string | null;
    ciudad: string | null;
    postulante_nombre: string;
    postulante_correo: string;
    animal_nombre: string;
    animal_especie: string;
    animal_estado: string;
    animal_imagen: string | null;
}

export const createSolicitud = async (data: NuevaSolicitud) => {
    const response = await apiClient.post('/solicitudes', data);
    return response.data;
};

/** Solicitudes que envió el usuario con sesión iniciada. */
export const getMisSolicitudes = async (): Promise<Solicitud[]> => {
    const response = await apiClient.get('/solicitudes', { params: { mias: true } });
    return response.data.data;
};

/** Estado HTTP y mensaje del servidor (o uno genérico si no hubo respuesta). */
export const solicitudError = apiError;

/** Solicitudes recibidas: para un rescatista, las de sus animales; para un admin, todas. */
export const getSolicitudesRecibidas = async (): Promise<Solicitud[]> => {
    const response = await apiClient.get('/solicitudes');
    return response.data.data;
};

export const updateSolicitudEstado = async (id: number, estado: 'APROBADA' | 'RECHAZADA') => {
    const response = await apiClient.patch(`/solicitudes/${id}`, { estado });
    return response.data;
};