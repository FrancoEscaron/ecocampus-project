const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
require("dotenv").config({ path: path.join(__dirname, "..", ".env.atlas"), quiet: true });

const ORIGEN = process.env.MONGODB_URI;
const DESTINO = process.env.MONGODB_URI_ATLAS;
const RESET = process.argv.includes("--reset");
const LOTE = 500;

if (!ORIGEN) {
  console.error("Falta MONGODB_URI en backend/.env");
  process.exit(1);
}

if (!DESTINO) {
  console.error("Falta MONGODB_URI_ATLAS en backend/.env.atlas");
  process.exit(1);
}

if (ORIGEN === DESTINO) {
  console.error("Origen y destino son la misma cadena. Abortado.");
  process.exit(1);
}

async function main() {
  const local = mongoose.createConnection(ORIGEN, { serverSelectionTimeoutMS: 15000 });
  const atlas = mongoose.createConnection(DESTINO, { serverSelectionTimeoutMS: 20000 });

  await local.asPromise();
  await atlas.asPromise();

  const dbOrigen = local.db;
  const dbDestino = atlas.db;

  console.log(`Origen:  ${dbOrigen.databaseName}`);
  console.log(`Destino: ${dbDestino.databaseName}`);
  console.log("");

  const nombres = (await dbOrigen.collections()).map((c) => c.collectionName).sort();
  const resumen = [];

  for (const nombre of nombres) {
    const docs = await dbOrigen.collection(nombre).find({}).toArray();
    let existentes = await dbDestino.collection(nombre).countDocuments();

    if (existentes > 0 && !RESET) {
      resumen.push({ coleccion: nombre, origen: docs.length, destino: existentes, estado: "omitida" });
      continue;
    }

    if (existentes > 0 && RESET) {
      await dbDestino.collection(nombre).deleteMany({});
      existentes = 0;
    }

    if (docs.length === 0) {
      resumen.push({ coleccion: nombre, origen: 0, destino: 0, estado: "vacia" });
      continue;
    }

    let insertados = 0;
    for (let i = 0; i < docs.length; i += LOTE) {
      const trozo = docs.slice(i, i + LOTE);
      const resultado = await dbDestino.collection(nombre).insertMany(trozo, { ordered: true });
      insertados += resultado.insertedCount;
    }

    const total = await dbDestino.collection(nombre).countDocuments();
    resumen.push({ coleccion: nombre, origen: docs.length, destino: total, estado: "copiada" });
  }

  console.log("Coleccion".padEnd(22), "Origen".padStart(7), "Destino".padStart(8), "  Estado");
  for (const fila of resumen) {
    console.log(
      fila.coleccion.padEnd(22),
      String(fila.origen).padStart(7),
      String(fila.destino).padStart(8),
      `  ${fila.estado}`
    );
  }

  const omitidas = resumen.filter((f) => f.estado === "omitida").length;
  if (omitidas > 0) {
    console.log("");
    console.log(`${omitidas} coleccion(es) ya tenian datos en el destino. Usa --reset para reemplazarlas.`);
  }

  await local.close();
  await atlas.close();
}

main().catch(async (error) => {
  const mensaje = String(error.message).replace(/mongodb(\+srv)?:\/\/[^@\s]*@/g, "mongodb://***@");
  console.error("Error:", mensaje);
  process.exit(1);
});
