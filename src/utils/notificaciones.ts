/** Aviso interno: las solicitudes del rescatista cambiaron (se aprobó, rechazó o eliminó algo). */
export const SOLICITUDES_ACTUALIZADAS_EVENT = 'huellas:solicitudes-actualizadas';

export function avisarSolicitudesActualizadas() {
    window.dispatchEvent(new Event(SOLICITUDES_ACTUALIZADAS_EVENT));
}