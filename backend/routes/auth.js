const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { rateLimit } = require("express-rate-limit");

const pool = require("../db");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Demasiados intentos. Intenta nuevamente más tarde.",
  },
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { correo, contrasena } = req.body || {};

    if (
      typeof correo !== "string" ||
      typeof contrasena !== "string" ||
      !correo.trim() ||
      !contrasena
    ) {
      return res.status(400).json({
        message: "Ingresa tu correo y contraseña.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET no está configurado");
      return res.status(500).json({
        message: "Error de configuración del servidor.",
      });
    }

    const resultado = await pool.query(
      `SELECT id_usuario, nombre, correo,
              contrasena_hash, rol, organizacion_id
       FROM usuarios
       WHERE LOWER(correo) = LOWER($1)
       LIMIT 1`,
      [correo.trim()],
    );

    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos.",
      });
    }

    const contrasenaCorrecta = await bcrypt.compare(
      contrasena,
      usuario.contrasena_hash,
    );

    if (!contrasenaCorrecta) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos.",
      });
    }

    const token = jwt.sign(
      {
        sub: String(usuario.id_usuario),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
        issuer: "ayudasxcol",
        audience: "ayudasxcol-api",
        algorithm: "HS256",
      },
    );

    return res.json({
      message: "Inicio de sesión exitoso.",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        organizacion_id: usuario.organizacion_id,
      },
    });
  } catch (error) {
    console.error("Error de autenticación:", error);

    return res.status(500).json({
      message: "Ocurrió un error al iniciar sesión.",
    });
  }
});

module.exports = router;
