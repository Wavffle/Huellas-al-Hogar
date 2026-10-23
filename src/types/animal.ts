export interface Animal {
    id: number;
    nombre: string;
    especie: string;
    edad?: number | null;
    edad_meses?: number | null;
    sexo?: 'MACHO' | 'HEMBRA';
    tamanho?: 'PEQUEÑO' | 'MEDIANO' | 'GRANDE' | 'PEQUENO';
    ciudad?: string;
    rescate?: 'RESCATE' | 'ENTREGADO_FAMILIA' | 'REFUGIO' | 'CAMADA';
    descripcion?: string;
    personalidad?: string;
    ideal_para?: string[];
    convive_con?: string[];
    etiquetas?: string[];
    cuidado_especial?: string;
    razon_adopcion?: string;
    vacunas_estado?: 'AL_DIA' | 'FALTAN' | 'NO_TIENE';
    vacunas_detalles?: string;
    esterilizado?: 'SI' | 'NO' | 'NO_SABE';
    fecha_esterilizacion?: string | null;
    estado?: 'EN_ADOPCION' | 'ADOPTADO' | 'EN_TRATAMIENTO';
    creado_en?: string;
    usuario_id: number;
    
    // Propiedades extra armadas en el backend con JOINs o Multer
    imagen_portada?: string; 
    fotos?: { id: number; imagen_url: string; orden: number }[];
}
