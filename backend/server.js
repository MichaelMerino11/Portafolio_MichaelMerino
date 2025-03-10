import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🔹 Asegurar que Render reconoce la API
app.get("/", (req, res) => {
  res.send("🚀 API corriendo correctamente en Render");
});

// 🔹 Ruta para enviar correos
app.post("/send-email", async (req, res) => {
  console.log("📩 Recibida petición en /send-email");
  console.log("🔹 Datos recibidos:", req.body);

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
    console.log("✅ Correo enviado con éxito");
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
