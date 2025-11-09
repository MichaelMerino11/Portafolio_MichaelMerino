import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS más permisivo para debug
app.use(
  cors({
    origin: "*", // Temporalmente permite todo para debug
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de todas las peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Body:", req.body);
  next();
});

// Configuración de Nodemailer para Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true, // Habilitar logs de debug
  logger: true, // Habilitar logger
});

// Verificar configuración al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error en configuración de email:", error);
  } else {
    console.log("✅ Servidor listo para enviar emails");
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor funcionando",
    timestamp: new Date().toISOString(),
    env: {
      emailUser: process.env.EMAIL_USER ? "Configurado" : "NO configurado",
      emailPass: process.env.EMAIL_PASS ? "Configurado" : "NO configurado",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
  });
});

// Validaciones
const validationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("El mensaje es requerido")
    .isLength({ min: 10, max: 2000 })
    .withMessage("El mensaje debe tener entre 10 y 2000 caracteres"),
];

// Ruta para enviar emails
app.post("/send-email", validationRules, async (req, res) => {
  console.log("📧 Recibida petición de envío de email");
  console.log("Body recibido:", req.body);

  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Errores de validación:", errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, message } = req.body;

    console.log("📝 Datos a enviar:", {
      name,
      email,
      message: message.substring(0, 50),
    });

    // Email para ti
    const mailOptionsToMe = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `📩 Nuevo mensaje de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nuevo mensaje de contacto</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            Enviado el ${new Date().toLocaleString("es-ES")}
          </p>
        </div>
      `,
      text: `
        Nuevo mensaje de contacto
        
        Nombre: ${name}
        Email: ${email}
        
        Mensaje:
        ${message}
        
        Enviado el ${new Date().toLocaleString("es-ES")}
      `,
    };

    // Email de confirmación
    const mailOptionsToUser = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "✅ He recibido tu mensaje - Michael Merino",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">¡Gracias por contactarme!</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>He recibido tu mensaje y te responderé lo antes posible.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              Tu mensaje: "${message.substring(0, 100)}${
        message.length > 100 ? "..." : ""
      }"
            </p>
          </div>
          <p>Saludos,<br><strong>Michael Merino</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">
            GitHub: <a href="https://github.com/MichaelMerino11">MichaelMerino11</a><br>
            LinkedIn: <a href="https://www.linkedin.com/in/michael-merino-0b7871207/">Michael Merino</a>
          </p>
        </div>
      `,
      text: `
        Hola ${name},
        
        ¡Gracias por contactarme! He recibido tu mensaje y te responderé lo antes posible.
        
        Tu mensaje: ${message}
        
        Saludos,
        Michael Merino
      `,
    };

    console.log("📤 Enviando email a ti...");
    await transporter.sendMail(mailOptionsToMe);
    console.log("✅ Email enviado a ti");

    console.log("📤 Enviando confirmación al usuario...");
    await transporter.sendMail(mailOptionsToUser);
    console.log("✅ Confirmación enviada al usuario");

    res.status(200).json({
      success: true,
      message: "Mensaje enviado exitosamente",
    });
  } catch (error) {
    console.error("❌ ERROR COMPLETO:", error);
    console.error("Stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje",
      error: error.message,
      details: error.toString(),
    });
  }
});

// 404
app.use((req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error global:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER}`);
  console.log(`🔑 Pass configurado: ${process.env.EMAIL_PASS ? "SÍ" : "NO"}`);
});

export default app;
