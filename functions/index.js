const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configurar el transporte de correo (necesitarás configurar esto con tus credenciales SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendInvitationEmail = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { invitationId, email, nombre, titularEmail } = data;

  // Generar URL de registro con el ID de invitación
  const registrationUrl = `https://tu-app.com/registro?invitacion=${invitationId}`;

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
    throw new functions.https.HttpsError('internal', 'Error al enviar la invitación por correo');
  }
});

// Función que se ejecuta cuando se crea una nueva invitación
exports.onInvitationCreated = functions.firestore
  .document('invitations/{invitationId}')
  .onCreate(async (snap, context) => {
    const invitation = snap.data();
    
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
        if (doc.id !== context.params.invitationId) {
          batch.delete(doc.ref);
        }
      });
      await batch.commit();
    }
  }); 