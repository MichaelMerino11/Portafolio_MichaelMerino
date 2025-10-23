import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://portafolio-michael-merino-wqho.vercel.app/",
    /\.vercel\.app$/, // Permite cualquier subdominio de vercel.app
  ],
  methods: ["POST", "GET", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verificar configuración del transporter al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error en la configuración de email:", error);
  } else {
    console.log("✅ Servidor listo para enviar emails");
  }
});

// Validaciones personalizadas
const validationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email es demasiado largo"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("El mensaje es requerido")
    .isLength({ min: 10, max: 2000 })
    .withMessage("El mensaje debe tener entre 10 y 2000 caracteres"),
];

// Sanitización de datos
const sanitizeInput = (text) => {
  return text
    .replace(/[<>]/g, "") // Eliminar < y >
    .trim();
};

// Ruta de health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Ruta principal para enviar emails
app.post("/send-email", validationRules, async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Sanitizar datos
    const { name, email, message } = req.body;
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedMessage = sanitizeInput(message);

    // Configuración del email para ti (notificación)
    const mailOptionsToMe = {
      from: `"Formulario Portfolio" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: sanitizedEmail,
      subject: `📩 Nuevo mensaje de ${sanitizedName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                padding: 30px;
              }
              .info-box {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
              }
              .info-label {
                font-weight: bold;
                color: #667eea;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 5px;
              }
              .info-value {
                color: #333;
                font-size: 16px;
              }
              .message-box {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border: 1px solid #e0e0e0;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #e0e0e0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📬 Nuevo Mensaje de Contacto</h1>
              </div>
              <div class="content">
                <div class="info-box">
                  <div class="info-label">Nombre</div>
                  <div class="info-value">${sanitizedName}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Email</div>
                  <div class="info-value">${sanitizedEmail}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Mensaje</div>
                  <div class="message-box">${sanitizedMessage}</div>
                </div>
              </div>
              <div class="footer">
                <p>Este mensaje fue enviado desde tu portafolio web</p>
                <p>Fecha: ${new Date().toLocaleString("es-ES", {
                  timeZone: "America/Guayaquil",
                })}</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Nuevo mensaje de contacto
        
        Nombre: ${sanitizedName}
        Email: ${sanitizedEmail}
        
        Mensaje:
        ${sanitizedMessage}
        
        ---
        Enviado desde tu portafolio web
        Fecha: ${new Date().toLocaleString("es-ES", {
          timeZone: "America/Guayaquil",
        })}
      `,
    };

    // Configuración del email de confirmación para el usuario
    const mailOptionsToUser = {
      from: `"Michael Merino" <${process.env.EMAIL_USER}>`,
      to: sanitizedEmail,
      subject: "✅ He recibido tu mensaje - Michael Merino",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 40px 30px;
              }
              .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
              }
              .message {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin: 20px 0;
              }
              .cta-box {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
                text-align: center;
              }
              .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e0e0e0;
              }
              .social-links {
                margin: 15px 0;
              }
              .social-links a {
                color: #667eea;
                text-decoration: none;
                margin: 0 10px;
                font-size: 14px;
              }
              .emoji {
                font-size: 24px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">✅</div>
                <h1>¡Mensaje Recibido!</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Hola <strong>${sanitizedName}</strong>,
                </div>
                <div class="message">
                  <p>¡Gracias por ponerte en contacto conmigo! He recibido tu mensaje correctamente y me pondré en contacto contigo lo antes posible.</p>
                  <p>Normalmente respondo en un plazo de 24-48 horas. Mientras tanto, puedes conocer más sobre mi trabajo en mi portfolio.</p>
                </div>
                <div class="cta-box">
                  <p style="margin: 0; color: #666; font-size: 14px;">
                    📧 <strong>Recibido:</strong> ${sanitizedMessage.substring(
                      0,
                      100
                    )}${sanitizedMessage.length > 100 ? "..." : ""}
                  </p>
                </div>
              </div>
              <div class="footer">
                <p style="margin: 10px 0; color: #333; font-weight: bold;">Michael Merino</p>
                <p style="margin: 10px 0; color: #666;">Desarrollador Full Stack</p>
                <div class="social-links">
                  <a href="https://github.com/MichaelMerino11">GitHub</a> |
                  <a href="https://www.linkedin.com/in/michael-merino-0b7871207/">LinkedIn</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                  Este es un email automático, por favor no respondas a este mensaje.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Hola ${sanitizedName},
        
        ¡Gracias por ponerte en contacto conmigo! He recibido tu mensaje correctamente y me pondré en contacto contigo lo antes posible.
        
        Tu mensaje:
        ${sanitizedMessage}
        
        Saludos,
        Michael Merino
        Desarrollador Full Stack
        
        GitHub: https://github.com/MichaelMerino11
        LinkedIn: https://www.linkedin.com/in/michael-merino-0b7871207/
      `,
    };

    // Enviar ambos emails
    await transporter.sendMail(mailOptionsToMe);
    await transporter.sendMail(mailOptionsToUser);

    console.log(`✅ Email enviado desde: ${sanitizedEmail}`);

    res.status(200).json({
      success: true,
      message:
        "Mensaje enviado exitosamente. Recibirás una confirmación en tu email.",
    });
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje. Por favor, intenta nuevamente.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📧 Email configurado: ${process.env.EMAIL_USER}`);
});

export default app;
