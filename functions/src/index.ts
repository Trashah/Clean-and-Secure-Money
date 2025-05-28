/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineString } from "firebase-functions/params";
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

interface InvitationData {
  invitationId: string;
  email: string;
  nombre: string;
  titularEmail: string;
}

// Definir las variables de configuración
const emailUser = defineString('EMAIL_USER');
const emailPassword = defineString('EMAIL_PASSWORD');

// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser.value(),
    pass: emailPassword.value()
  }
});

export const sendInvitationEmail = onCall<InvitationData>(async (request) => {
  // Verificar que el usuario está autenticado
  if (!request.auth) {
    throw new Error('Usuario no autenticado');
  }

  const { invitationId, email, nombre, titularEmail } = request.data;

  // Generar URL de registro con el ID de invitación
  const registrationUrl = `https://clean-and--money.web.app/registro?invitacion=${invitationId}`;

  // Plantilla del correo
  const mailOptions = {
    from: '"Clean&SecureMoney" <noreply@cleanandmoney.com>',
    to: email,
    subject: 'Invitación para unirte como colaborador',
    html: `
      <h2>¡Hola ${nombre}!</h2>
      <p>Has sido invitado por ${titularEmail} para unirte como colaborador en Clean&SecureMoney.</p>
      <p>Para completar tu registro, haz clic en el siguiente enlace:</p>
      <p>
        <a href="${registrationUrl}" style="
          background-color: #684a8e;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
        ">
          Completar registro
        </a>
      </p>
      <p>Este enlace expirará en 7 días.</p>
      <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('Error al enviar la invitación por correo');
  }
});

// Función que se ejecuta cuando se crea una nueva invitación
export const onInvitationCreated = onDocumentCreated('invitations/{invitationId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }

  const invitation = snapshot.data();
  if (!invitation) {
    return;
  }
    
  // Verificar si la invitación ya existe para este email
  const existingInvitations = await admin.firestore()
    .collection('invitations')
    .where('email', '==', invitation.email)
    .where('status', '==', 'pending')
    .get();

  // Si hay más de una invitación pendiente (contando la que acabamos de crear)
  if (existingInvitations.size > 1) {
    // Eliminar invitaciones anteriores
    const batch = admin.firestore().batch();
    existingInvitations.docs.forEach(doc => {
      if (doc.id !== event.params.invitationId) {
        batch.delete(doc.ref);
      }
    });
    await batch.commit();
  }
});
