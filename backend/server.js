import express from "express";
import cors from "cors";
import { Resend } from "resend";
import { body, validationResult } from "express-validator";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor funcionando con Resend",
    timestamp: new Date().toISOString(),
    env: {
      resendKey: process.env.RESEND_API_KEY ? "Configurado" : "NO configurado",
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

    console.log("📝 Datos:", { name, email });

    // Email para ti (notificación)
    const emailToMe = await resend.emails.send({
      from: "Portafolio <onboarding@resend.dev>", // Email verificado de Resend
      to: "maikijunior9@gmail.com", // Tu email personal
      reply_to: email, // Para que puedas responder directamente
      subject: `📩 Nuevo mensaje de ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .info-box {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
              }
              .label {
                font-weight: bold;
                color: #667eea;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 5px;
              }
              .value {
                color: #333;
                font-size: 16px;
              }
              .message-box {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border: 1px solid #e0e0e0;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-radius: 0 0 10px 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">📬 Nuevo Mensaje</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="label">Nombre</div>
                <div class="value">${name}</div>
              </div>
              <div class="info-box">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="info-box">
                <div class="label">Mensaje</div>
                <div class="message-box">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>Mensaje recibido desde tu portafolio</p>
              <p>${new Date().toLocaleString("es-ES", {
                timeZone: "America/Guayaquil",
              })}</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("✅ Email enviado a ti:", emailToMe.data?.id);

    // Email de confirmación al usuario
    const emailToUser = await resend.emails.send({
      from: "Michael Merino <onboarding@resend.dev>",
      to: email,
      subject: "✅ He recibido tu mensaje",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                padding: 40px 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .emoji {
                font-size: 48px;
                margin-bottom: 10px;
              }
              .message {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin: 20px 0;
              }
              .quote-box {
                background: #f8f9fa;
                padding: 20px;
                border-left: 4px solid #667eea;
                border-radius: 4px;
                margin: 25px 0;
                font-style: italic;
                color: #666;
              }
              .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-radius: 0 0 10px 10px;
              }
              .social-links {
                margin: 20px 0;
              }
              .social-links a {
                color: #667eea;
                text-decoration: none;
                margin: 0 15px;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="emoji">✅</div>
              <h1 style="margin: 0; font-size: 28px;">¡Mensaje Recibido!</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #333;">
                Hola <strong>${name}</strong>,
              </p>
              <div class="message">
                <p>¡Gracias por ponerte en contacto conmigo! He recibido tu mensaje correctamente.</p>
                <p>Me pondré en contacto contigo lo antes posible, generalmente respondo en un plazo de 24-48 horas.</p>
              </div>
              <div class="quote-box">
                <strong>Tu mensaje:</strong><br><br>
                "${message.substring(0, 150)}${
        message.length > 150 ? "..." : ""
      }"
              </div>
              <p style="margin-top: 30px; color: #666;">
                Mientras tanto, puedes conocer más sobre mi trabajo en mis redes:
              </p>
            </div>
            <div class="footer">
              <p style="margin: 10px 0; color: #333; font-weight: bold; font-size: 18px;">
                Michael Merino
              </p>
              <p style="margin: 10px 0; color: #666;">
                Desarrollador Full Stack
              </p>
              <div class="social-links">
                <a href="https://github.com/MichaelMerino11">GitHub</a>
                <a href="https://www.linkedin.com/in/michael-merino-0b7871207/">LinkedIn</a>
              </div>
              <p style="margin-top: 30px; font-size: 12px; color: #999;">
                Este es un correo automático. Para cualquier consulta adicional,<br>
                simplemente responde a este email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("✅ Confirmación enviada al usuario:", emailToUser.data?.id);

    res.status(200).json({
      success: true,
      message:
        "Mensaje enviado exitosamente. Recibirás una confirmación en tu email.",
    });
  } catch (error) {
    console.error("❌ ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje. Por favor, intenta nuevamente.",
      error: error.message,
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(
    `📧 Resend configurado: ${process.env.RESEND_API_KEY ? "SÍ" : "NO"}`
  );
});

export default app;
