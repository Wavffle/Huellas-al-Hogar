import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

//Envia una notificación por correo cuando se crea una nueva solicitud de adopción
export const enviarCorreoSolicitud = async ({ emailDestino, nombreAnimal, nombrePostulante }) => {
  try {
    await resend.emails.send({
      from: "Huellas al Hogar <onboarding@resend.dev>", // Dominio de pruebas de Resend
      to: [emailDestino],
      subject: `¡Nueva solicitud de adopción recibida para ${nombreAnimal}! 🐾`,
      html: `
        <h2>¡Hola!</h2>
        <p>Has recibido una nueva postulación en <strong>Huellas al Hogar</strong>.</p>
        <p><strong>Postulante:</strong> ${nombrePostulante}</p>
        <p><strong>Mascota:</strong> ${nombreAnimal}</p>
        <hr />
        <p>Ingresa a la plataforma para revisar los detalles y responder la solicitud.</p>
      `,
    });
  } catch (error) {
    // Si falla el envío del correo, se captura aquí para no romper la creación de la solicitud en la BD
    console.error("Error al enviar el correo con Resend:", error);
  }
};