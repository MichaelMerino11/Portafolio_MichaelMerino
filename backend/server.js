import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { body, validationResult } from "express-validator"; // 🔹 Importamos express-validator

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🔹 Ruta de prueba para Render
app.get("/", (req, res) => {
  res.send("🚀 API corriendo correctamente en Render");
});

// 🔹 Validaciones antes de procesar el correo
const validateContactForm = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail(),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("El mensaje no puede estar vacío")
    .isLength({ min: 10, max: 500 })
    .withMessage("El mensaje debe tener entre 10 y 500 caracteres"),
];

// 🔹 Ruta para enviar correos con validaciones
// 🔹 Ruta para enviar correos con validaciones
app.post("/send-email", validateContactForm, async (req, res) => {
  console.log("📩 Recibida petición en /send-email");

  // 🔹 Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ Errores en el formulario:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;

  // En lugar de service: "gmail"
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // Este es el puerto SSL de Gmail
    secure: false, // Usar SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // La contraseña SIN espacios
    },
    // Agregamos esto para ver si hay problemas de timeout
    connectionTimeout: 10000, // 10 segundos
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: `"Tu Portafolio" <${process.env.EMAIL_USER}>`, // 👈 Envía desde tu propio email
    to: process.env.EMAIL_USER, // 👈 Recibes el correo en tu email
    replyTo: email, // 👈 Para poder responder al visitante
    subject: `Nuevo Mensaje de Portafolio de: ${name}`, // 👈 Asunto mejorado

    // 👈 Cuerpo del mensaje mejorado para incluir toda la info
    text: `Has recibido un nuevo mensaje de tu portafolio:
    
    Nombre: ${name}
    Email: ${email}
    
    Mensaje:
    ${message}
    `,

    // (Opcional) Versión HTML para que se vea mejor
    html: `
      <h3>Nuevo Mensaje del Portafolio</h3>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <hr />
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  };
  // --- 👆 FIN DE LA CORRECCIÓN ---

  try {
    console.log("🚀 Enviando correo...");
    await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado con éxito");
    res.status(200).json({ message: "Correo enviado con éxito" });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    // Errores comunes son: contraseña de app inválida, o cuenta bloqueada por seguridad.
    res.status(500).json({ error: "Error al enviar el correo" });
  }
});

// 🔹 Si no encuentra la ruta, devolver un error 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(PORT, () =>
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`)
);
