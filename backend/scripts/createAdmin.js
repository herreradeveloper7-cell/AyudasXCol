require("dotenv").config();

const readline = require("node:readline/promises");
const bcrypt = require("bcryptjs");
const pool = require("../db");

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const nombre = (await rl.question("Nombre del administrador: ")).trim();
    const correo = (await rl.question("Correo del administrador: "))
      .trim()
      .toLowerCase();

    const contrasena = await rl.question("Contraseña (mínimo 12 caracteres): ");

    if (
      !nombre ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
      contrasena.length < 12 ||
      Buffer.byteLength(contrasena, "utf8") > 72
    ) {
      throw new Error(
        "Verifica el nombre, el correo y una contraseña de 12 a 72 bytes.",
      );
    }

    const hash = await bcrypt.hash(contrasena, 12);

    const resultado = await pool.query(
      `INSERT INTO usuarios
         (nombre, correo, contrasena_hash, rol, organizacion_id)
       VALUES ($1, $2, $3, 'administrador', NULL)
       RETURNING id_usuario, nombre, correo, rol`,
      [nombre, correo, hash],
    );

    console.log("\nAdministrador creado correctamente:");
    console.log(resultado.rows[0]);
  } finally {
    rl.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(
    "No fue posible crear el administrador:",
    error.code === "23505" ? "Ese correo ya está registrado." : error.message,
  );
  process.exitCode = 1;
});
