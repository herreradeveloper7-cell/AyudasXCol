const jwt = require("jsonwebtoken");
const pool = require("../db");

async function autenticar(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Debes iniciar sesión para realizar esta acción.",
    });
  }

  const token = authorization.split(" ")[1];

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "ayudasxcol",
      audience: "ayudasxcol-api",
    });
  } catch (error) {
    return res.status(401).json({
      message: "Tu sesión ha expirado o el token no es válido.",
    });
  }

  try {
    const resultado = await pool.query(
      `SELECT id_usuario, nombre, correo, rol, organizacion_id
       FROM usuarios
       WHERE id_usuario = $1`,
      [payload.sub],
    );

    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({
        message: "El usuario no existe.",
      });
    }

    req.usuario = usuario;

    next();
  } catch (error) {
    console.error("Error de autenticación:", error);

    return res.status(500).json({
      message: "Error al verificar la sesión.",
    });
  }
}

function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuario no autenticado.",
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        message: "No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
}

module.exports = {
  autenticar,
  autorizar,
};
