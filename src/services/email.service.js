import { Resend } from "resend";

// El cliente se crea al enviar (no al cargar el módulo), para que el servidor
// arranque aunque falte RESEND_API_KEY.
let cliente = null;
const obtenerCliente = () => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cliente) cliente = new Resend(process.env.RESEND_API_KEY);
  return cliente;
};

// Escapa los caracteres HTML para que un nombre no pueda inyectar código en el correo
const escaparHtml = (texto) =>
    String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

//Envia una notificación por correo cuando se crea una nueva solicitud de adopción
export const enviarCorreoSolicitud = async ({ emailDestino, nombreAnimal, nombrePostulante }) => {
  try {
    const resend = obtenerCliente();
    if (!resend) {
      console.warn("RESEND_API_KEY no está configurada: no se envió el correo de la solicitud.");
      return;
    }

    await resend.emails.send({
      from: "Huellas al Hogar <onboarding@resend.dev>", // Dominio de pruebas de Resend
      to: [emailDestino],
      subject: `¡Nueva solicitud de adopción recibida para ${nombreAnimal}! 🐾`,
      html: `
        <h2>¡Hola!</h2>
        <p>Has recibido una nueva postulación en <strong>Huellas al Hogar</strong>.</p>
        <p><strong>Postulante:</strong> ${escaparHtml(nombrePostulante)}</p>
        <p><strong>Mascota:</strong> ${escaparHtml(nombreAnimal)}</p>
        <hr />
        <p>Ingresa a la plataforma para revisar los detalles y responder la solicitud.</p>
      `,
    });
  } catch (error) {
    // Si falla el envío del correo, se captura aquí para no romper la creación de la solicitud en la BD
    console.error("Error al enviar el correo con Resend:", error);
  }
};