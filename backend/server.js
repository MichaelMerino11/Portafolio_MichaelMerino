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
app.post("/send-email", validateContactForm, async (req, res) => {
  console.log("📩 Recibida petición en /send-email");

  // 🔹 Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ Errores en el formulario:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Mensaje de ${name}`,
    text: message,
  };

  try {
    console.log("🚀 Enviando correo...");
    await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado con éxitoaaaaaa");
    res.status(200).json({ message: "Correo enviado con éxito" });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
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
