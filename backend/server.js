require("dotenv").config();

const { autenticar, autorizar } = require("./middlewares/auth");
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/auth");

const bcrypt = require("bcryptjs");

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API de AyudasXCol funcionando",
  });
});

app.get("/api/database", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS fecha",
    );

    res.json({
      connected: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error de PostgreSQL:", error.message);

    res.status(500).json({
      connected: false,
      message: "No se pudo conectar a PostgreSQL",
    });
  }
});

app.get("/api/comunidades", autenticar, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id_comunidad,
        nombre,
        municipio,
        descripcion,
        latitud,
        longitud
      FROM comunidades
      ORDER BY id_comunidad DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al consultar comunidades:", error.message);

    res.status(500).json({
      message: "Error al consultar comunidades",
    });
  }
});

app.post(
  "/api/comunidades",
  autenticar,
  autorizar("administrador"),
  async (req, res) => {
    try {
      const { nombre, municipio, descripcion, latitud, longitud } =
        req.body || {};

      if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        typeof municipio !== "string" ||
        !municipio.trim() ||
        latitud === undefined ||
        longitud === undefined ||
        latitud === null ||
        longitud === null ||
        latitud === "" ||
        longitud === ""
      ) {
        return res.status(400).json({
          message: "Nombre, municipio, latitud y longitud son obligatorios",
        });
      }

      const lat = Number(latitud);
      const lng = Number(longitud);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return res.status(400).json({
          message: "Las coordenadas no son válidas",
        });
      }

      const result = await pool.query(
        `INSERT INTO comunidades
        (nombre, municipio, descripcion, latitud, longitud)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
        [
          nombre.trim(),
          municipio.trim(),
          typeof descripcion === "string" ? descripcion.trim() : null,
          lat,
          lng,
        ],
      );

      res.status(201).json({
        message: "Comunidad registrada correctamente",
        comunidad: result.rows[0],
      });
    } catch (error) {
      console.error("Error al registrar comunidad:", error.message);

      res.status(500).json({
        message: "No se pudo registrar la comunidad",
      });
    }
  },
);

app.get("/api/necesidades", autenticar, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        n.id_necesidad,
        n.comunidad_id,
        c.nombre AS comunidad,
        c.municipio,
        n.categoria,
        n.descripcion,
        n.cantidad_estimada,
        n.fecha_registro,
        n.estado_verificacion
      FROM necesidades n
      INNER JOIN comunidades c
        ON c.id_comunidad = n.comunidad_id
      ORDER BY n.fecha_registro DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al consultar necesidades:", error.message);

    res.status(500).json({
      message: "No se pudieron consultar las necesidades",
    });
  }
});

app.post(
  "/api/necesidades",
  autenticar,
  autorizar("administrador"),
  async (req, res) => {
    try {
      const { comunidad_id, categoria, descripcion, cantidad_estimada } =
        req.body || {};

      const comunidadId = Number(comunidad_id);
      const cantidad = Number(cantidad_estimada);

      if (!Number.isSafeInteger(comunidadId) || comunidadId <= 0) {
        return res.status(400).json({
          message: "Debes indicar una comunidad válida",
        });
      }

      if (
        typeof categoria !== "string" ||
        !categoria.trim() ||
        typeof descripcion !== "string" ||
        !descripcion.trim()
      ) {
        return res.status(400).json({
          message: "La categoría y la descripción son obligatorias",
        });
      }

      if (
        cantidad_estimada === undefined ||
        cantidad_estimada === null ||
        cantidad_estimada === "" ||
        !Number.isSafeInteger(cantidad) ||
        cantidad < 0
      ) {
        return res.status(400).json({
          message: "La cantidad estimada debe ser un número entero no negativo",
        });
      }

      const comunidad = await pool.query(
        "SELECT id_comunidad FROM comunidades WHERE id_comunidad = $1",
        [comunidadId],
      );

      if (comunidad.rowCount === 0) {
        return res.status(404).json({
          message: "La comunidad seleccionada no existe",
        });
      }

      const result = await pool.query(
        `INSERT INTO necesidades
        (comunidad_id, categoria, descripcion, cantidad_estimada)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
        [comunidadId, categoria.trim(), descripcion.trim(), cantidad],
      );

      res.status(201).json({
        message: "Necesidad registrada correctamente",
        necesidad: result.rows[0],
      });
    } catch (error) {
      console.error("Error al registrar necesidad:", error.message);

      res.status(500).json({
        message: "No se pudo registrar la necesidad",
      });
    }
  },
);

app.get("/api/organizaciones", autenticar, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id_organizacion,
        nombre,
        descripcion,
        contacto_institucional
      FROM organizaciones
      ORDER BY nombre ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al consultar organizaciones:", error.message);

    res.status(500).json({
      message: "No se pudieron consultar las organizaciones",
    });
  }
});

app.post(
  "/api/organizaciones",
  autenticar,
  autorizar("administrador"),
  async (req, res) => {
    try {
      const { nombre, descripcion, contacto_institucional } = req.body || {};

      if (typeof nombre !== "string" || !nombre.trim()) {
        return res.status(400).json({
          message: "El nombre de la organización es obligatorio",
        });
      }

      if (
        typeof contacto_institucional !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto_institucional.trim())
      ) {
        return res.status(400).json({
          message: "Ingresa un correo institucional válido.",
        });
      }

      const correoExistente = await pool.query(
        `SELECT id_organizacion
       FROM organizaciones
       WHERE LOWER(TRIM(contacto_institucional)) = $1`,
        [contacto_institucional.trim().toLowerCase()],
      );

      if (correoExistente.rowCount > 0) {
        return res.status(409).json({
          message: "Este correo ya pertenece a otra organización.",
        });
      }

      const result = await pool.query(
        `INSERT INTO organizaciones
        (nombre, descripcion, contacto_institucional)
       VALUES ($1, $2, $3)
       RETURNING *`,
        [
          nombre.trim(),
          typeof descripcion === "string" ? descripcion.trim() : null,
          typeof contacto_institucional === "string"
            ? contacto_institucional.trim()
            : null,
        ],
      );

      res.status(201).json({
        message: "Organización registrada correctamente",
        organizacion: result.rows[0],
      });
    } catch (error) {
      console.error("Error al registrar organización:", error.message);

      if (error.code === "23505") {
        return res.status(409).json({
          message: "Este correo ya pertenece a otra organización.",
        });
      }

      res.status(500).json({
        message: "No se pudo registrar la organización",
      });
    }
  },
);

app.get("/api/ayudas", autenticar, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id_ayuda,
        a.comunidad_id,
        c.nombre AS comunidad,
        c.municipio,
        a.necesidad_id,
        n.categoria AS necesidad_categoria,
        a.organizacion_id,
        o.nombre AS organizacion,
        a.tipo_ayuda,
        a.cantidad,
        a.fecha,
        a.estado,
        a.fecha_creacion
      FROM ayudas a
      INNER JOIN comunidades c
        ON c.id_comunidad = a.comunidad_id
      INNER JOIN organizaciones o
        ON o.id_organizacion = a.organizacion_id
      LEFT JOIN necesidades n
        ON n.id_necesidad = a.necesidad_id
      ORDER BY a.fecha_creacion DESC, a.id_ayuda DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al consultar ayudas:", error.message);

    res.status(500).json({
      message: "No se pudieron consultar las ayudas",
    });
  }
});

app.post(
  "/api/ayudas",
  autenticar,
  autorizar("administrador", "organizacion"),
  async (req, res) => {
    try {
      const {
        comunidad_id,
        necesidad_id,
        organizacion_id,
        tipo_ayuda,
        cantidad,
        fecha,
        estado,
      } = req.body || {};

      const comunidadId = Number(comunidad_id);
      const organizacionId = Number(organizacion_id);
      const cantidadNumero = Number(cantidad);
      const estadoFinal = estado ?? "programada";

      if (req.usuario.rol === "organizacion") {
        if (
          !req.usuario.organizacion_id ||
          String(req.usuario.organizacion_id) !== String(organizacion_id)
        ) {
          return res.status(403).json({
            message:
              "Solo puedes registrar ayudas en nombre de tu organización.",
          });
        }
      }

      if (
        !Number.isSafeInteger(comunidadId) ||
        comunidadId <= 0 ||
        !Number.isSafeInteger(organizacionId) ||
        organizacionId <= 0
      ) {
        return res.status(400).json({
          message: "La comunidad y la organización deben ser válidas",
        });
      }

      if (
        typeof tipo_ayuda !== "string" ||
        !tipo_ayuda.trim() ||
        tipo_ayuda.trim().length > 80
      ) {
        return res.status(400).json({
          message: "El tipo de ayuda debe tener entre 1 y 80 caracteres",
        });
      }

      if (
        cantidad === undefined ||
        cantidad === null ||
        cantidad === "" ||
        !Number.isSafeInteger(cantidadNumero) ||
        cantidadNumero <= 0 ||
        cantidadNumero > 2147483647
      ) {
        return res.status(400).json({
          message: "La cantidad debe ser un número entero positivo válido",
        });
      }

      if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({
          message: "La fecha debe tener el formato YYYY-MM-DD",
        });
      }

      const fechaObjeto = new Date(`${fecha}T12:00:00Z`);

      if (
        Number.isNaN(fechaObjeto.getTime()) ||
        fechaObjeto.toISOString().slice(0, 10) !== fecha
      ) {
        return res.status(400).json({
          message: "La fecha indicada no es válida",
        });
      }

      if (!["programada", "entregada"].includes(estadoFinal)) {
        return res.status(400).json({
          message: "El estado debe ser programada o entregada",
        });
      }

      const comunidad = await pool.query(
        "SELECT id_comunidad FROM comunidades WHERE id_comunidad = $1",
        [comunidadId],
      );

      if (comunidad.rowCount === 0) {
        return res.status(404).json({
          message: "La comunidad indicada no existe",
        });
      }

      const organizacion = await pool.query(
        "SELECT id_organizacion FROM organizaciones WHERE id_organizacion = $1",
        [organizacionId],
      );

      if (organizacion.rowCount === 0) {
        return res.status(404).json({
          message: "La organización indicada no existe",
        });
      }

      let necesidadId = null;

      if (
        necesidad_id !== undefined &&
        necesidad_id !== null &&
        necesidad_id !== ""
      ) {
        necesidadId = Number(necesidad_id);

        if (!Number.isSafeInteger(necesidadId) || necesidadId <= 0) {
          return res.status(400).json({
            message: "La necesidad indicada no es válida",
          });
        }

        const necesidad = await pool.query(
          `SELECT id_necesidad
         FROM necesidades
         WHERE id_necesidad = $1
           AND comunidad_id = $2`,
          [necesidadId, comunidadId],
        );

        if (necesidad.rowCount === 0) {
          return res.status(400).json({
            message: "La necesidad no pertenece a la comunidad indicada",
          });
        }
      }

      const result = await pool.query(
        `INSERT INTO ayudas
        (comunidad_id, necesidad_id, organizacion_id,
         tipo_ayuda, cantidad, fecha, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
        [
          comunidadId,
          necesidadId,
          organizacionId,
          tipo_ayuda.trim(),
          cantidadNumero,
          fecha,
          estadoFinal,
        ],
      );

      res.status(201).json({
        message: "Ayuda registrada correctamente",
        ayuda: result.rows[0],
      });
    } catch (error) {
      console.error("Error al registrar ayuda:", error.message);

      res.status(500).json({
        message: "No se pudo registrar la ayuda",
      });
    }
  },
);

app.get("/api/auth/me", autenticar, (req, res) => {
  res.json({
    usuario: req.usuario,
  });
});

app.get(
  "/api/admin/test",
  autenticar,
  autorizar("administrador"),
  (req, res) => {
    res.json({
      message: "Acceso de administrador autorizado.",
    });
  },
);

app.get(
  "/api/usuarios",
  autenticar,
  autorizar("administrador"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          u.id_usuario,
          u.nombre,
          u.correo,
          u.rol,
          u.organizacion_id,
          o.nombre AS organizacion,
          u.fecha_creacion
        FROM usuarios u
        LEFT JOIN organizaciones o
          ON o.id_organizacion = u.organizacion_id
        ORDER BY u.id_usuario DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al consultar usuarios:", error);

      res.status(500).json({
        message: "No se pudieron consultar los usuarios",
      });
    }
  },
);

app.post(
  "/api/usuarios",
  autenticar,
  autorizar("administrador"),
  async (req, res) => {
    try {
      const { nombre, correo, contrasena, rol, organizacion_id } =
        req.body || {};

      if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        nombre.trim().length > 120
      ) {
        return res.status(400).json({
          message: "Ingresa un nombre válido",
        });
      }

      if (
        typeof correo !== "string" ||
        correo.trim().length > 180 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
      ) {
        return res.status(400).json({
          message: "Ingresa un correo electrónico válido",
        });
      }

      if (
        typeof contrasena !== "string" ||
        contrasena.length < 12 ||
        Buffer.byteLength(contrasena, "utf8") > 72
      ) {
        return res.status(400).json({
          message:
            "La contraseña debe tener mínimo 12 caracteres y máximo 72 bytes",
        });
      }

      if (!["administrador", "organizacion"].includes(rol)) {
        return res.status(400).json({
          message: "El rol seleccionado no es válido",
        });
      }

      let organizacionId = null;

      if (rol === "organizacion") {
        organizacionId = Number(organizacion_id);

        if (!Number.isSafeInteger(organizacionId) || organizacionId <= 0) {
          return res.status(400).json({
            message: "Debes seleccionar una organización válida",
          });
        }

        const organizacion = await pool.query(
          `SELECT id_organizacion
           FROM organizaciones
           WHERE id_organizacion = $1`,
          [organizacionId],
        );

        if (organizacion.rowCount === 0) {
          return res.status(404).json({
            message: "La organización seleccionada no existe",
          });
        }
      }

      const correoNormalizado = correo.trim().toLowerCase();

      const usuarioExistente = await pool.query(
        `SELECT id_usuario
         FROM usuarios
         WHERE LOWER(correo) = $1`,
        [correoNormalizado],
      );

      if (usuarioExistente.rowCount > 0) {
        return res.status(409).json({
          message: "El correo electrónico ya está registrado",
        });
      }

      const contrasenaHash = await bcrypt.hash(contrasena, 12);

      const result = await pool.query(
        `INSERT INTO usuarios (
          nombre,
          correo,
          contrasena_hash,
          rol,
          organizacion_id
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id_usuario,
          nombre,
          correo,
          rol,
          organizacion_id,
          fecha_creacion`,
        [nombre.trim(), correoNormalizado, contrasenaHash, rol, organizacionId],
      );

      res.status(201).json({
        message: "Usuario registrado correctamente",
        usuario: result.rows[0],
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          message: "El correo electrónico ya está registrado",
        });
      }

      res.status(500).json({
        message: "No se pudo registrar el usuario",
      });
    }
  },
);

app.patch(
  "/api/necesidades/:id/estado",
  autenticar,
  autorizar("administrador"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { estado_verificacion } = req.body || {};

      const estadosPermitidos = ["pendiente", "verificado", "rechazado"];

      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "El ID de la necesidad no es válido",
        });
      }

      if (!estadosPermitidos.includes(estado_verificacion)) {
        return res.status(400).json({
          message: "El estado de verificación no es válido",
        });
      }

      const result = await pool.query(
        `UPDATE necesidades
         SET estado_verificacion = $1
         WHERE id_necesidad = $2
         RETURNING *`,
        [estado_verificacion, id],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "La necesidad indicada no existe",
        });
      }

      return res.status(200).json({
        message: "Estado de la necesidad actualizado correctamente",
        necesidad: result.rows[0],
      });
    } catch (error) {
      console.error("Error al actualizar necesidad:", error.message);

      return res.status(500).json({
        message: "No se pudo actualizar el estado de la necesidad",
      });
    }
  },
);

app.patch(
  "/api/ayudas/:id/estado",
  autenticar,
  autorizar("administrador", "organizacion"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body || {};

      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "El ID de la ayuda no es válido",
        });
      }

      if (!["programada", "entregada"].includes(estado)) {
        return res.status(400).json({
          message: "El estado indicado no es válido",
        });
      }

      const ayudaResult = await pool.query(
        `SELECT id_ayuda, organizacion_id, estado
         FROM ayudas
         WHERE id_ayuda = $1`,
        [id],
      );

      if (ayudaResult.rowCount === 0) {
        return res.status(404).json({
          message: "La ayuda indicada no existe",
        });
      }

      const ayuda = ayudaResult.rows[0];

      if (req.usuario.rol === "organizacion") {
        if (
          !req.usuario.organizacion_id ||
          String(ayuda.organizacion_id) !== String(req.usuario.organizacion_id)
        ) {
          return res.status(403).json({
            message: "Solo puedes actualizar ayudas de tu organización",
          });
        }

        if (estado !== "entregada") {
          return res.status(403).json({
            message:
              "Solo el administrador puede restablecer una ayuda a programada",
          });
        }
      }

      const result = await pool.query(
        `UPDATE ayudas
         SET estado = $1
         WHERE id_ayuda = $2
           AND (
             $3 = 'administrador'
             OR organizacion_id = $4
           )
         RETURNING *`,
        [estado, id, req.usuario.rol, req.usuario.organizacion_id],
      );

      if (result.rowCount === 0) {
        return res.status(409).json({
          message: "No fue posible actualizar la ayuda",
        });
      }

      return res.status(200).json({
        message: "Estado de la ayuda actualizado correctamente",
        ayuda: result.rows[0],
      });
    } catch (error) {
      console.error("Error al actualizar ayuda:", error.message);

      return res.status(500).json({
        message: "No se pudo actualizar el estado de la ayuda",
      });
    }
  },
);

app.listen(PORT, () => {
  console.log("==================================");
  console.log(" AYUDASXCOL - BACKEND");
  console.log("==================================");
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log("==================================");
});
