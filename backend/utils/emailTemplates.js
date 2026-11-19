const SITE_URL = (process.env.SITE_URL || "http://localhost:5173").trim().replace(/\/+$/, "");

const HTML_ENTITIES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (caracter) => HTML_ENTITIES[caracter]);

const formatDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return date.toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "America/Montevideo"
    });
};

const formatMoney = (amount, currency) => {
    const value = Number(amount) || 0;
    try {
        return new Intl.NumberFormat("es-UY", {
            style: "currency",
            currency: currency || "UYU"
        }).format(value);
    } catch {
        return `${currency || "UYU"} ${value.toFixed(2)}`;
    }
};

const PAYMENT_LABELS = {
    "eco-points": "Eco-Points",
    mixed: "Eco-Points y dinero",
    money: "Dinero (simulado)",
    free: "Curso gratuito"
};

const layout = ({ titulo, parrafos = [], datos = [], cita = "", boton = null, nota = "", pie = "" }) => {
    const filas = datos
        .map(([etiqueta, valor], indice) => {
            const borde = indice === 0 ? "none" : "1px solid #e5e7eb";
            return `<tr>
                <td style="padding:8px 0;border-top:${borde};font-size:14px;color:#6b7280;">${escapeHtml(etiqueta)}</td>
                <td style="padding:8px 0;border-top:${borde};font-size:14px;color:#111827;text-align:right;font-weight:bold;">${escapeHtml(valor)}</td>
            </tr>`;
        })
        .join("");

    return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(titulo)}</title>
</head>
<body style="margin:0;padding:24px;background-color:#f3f4f6;">
<div style="max-width:560px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="background-color:#047857;padding:20px 24px;border-radius:12px 12px 0 0;">
        <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.3px;">EcoCampus</span>
    </div>
    <div style="background-color:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#111827;">${escapeHtml(titulo)}</h1>
        ${parrafos.map((parrafo) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(parrafo)}</p>`).join("")}
        ${filas ? `<table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;">${filas}</table>` : ""}
        ${cita ? `<div style="margin:16px 0;padding:14px 16px;background-color:#f9fafb;border-left:4px solid #047857;border-radius:6px;font-size:14px;line-height:1.6;color:#374151;white-space:pre-wrap;">${escapeHtml(cita)}</div>` : ""}
        ${boton ? `<p style="margin:24px 0 8px;"><a href="${escapeHtml(boton.url)}" style="display:inline-block;background-color:#047857;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 20px;border-radius:8px;">${escapeHtml(boton.texto)}</a></p>` : ""}
        ${nota ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">${escapeHtml(nota)}</p>` : ""}
    </div>
    <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;text-align:center;">${escapeHtml(pie || "Recibiste este correo porque tenés una cuenta en EcoCampus.")}</p>
</div>
</body>
</html>`;
};

const buildWelcomeEmail = ({ to, nombre }) => {
    const subject = `¡Bienvenido/a a EcoCampus, ${nombre}!`;
    const parrafos = [
        `Hola ${nombre}:`,
        "Tu cuenta de EcoCampus ya está activa.",
        "Desde EcoCampus podés validar acciones sustentables, sumar Eco-Points y canjearlos por cursos. También podés seguir tu progreso en cada curso desde tu panel."
    ];

    return {
        to,
        subject,
        text: `${parrafos.join("\n\n")}\n\nPara empezar, ingresá en ${SITE_URL}/ingresar\n\nEste correo se envió automáticamente. No respondas a este mensaje.`,
        html: layout({
            titulo: "¡Te damos la bienvenida!",
            parrafos,
            boton: { texto: "Ingresar a EcoCampus", url: `${SITE_URL}/ingresar` },
            nota: "Este correo se envió automáticamente. No respondas a este mensaje."
        })
    };
};

const buildSubmissionReviewedEmail = ({
    to,
    nombre,
    accion,
    aprobada,
    puntos = 0,
    totalPuntos = 0,
    motivo = "",
    disponibleDesde = null
}) => {
    const titulo = aprobada ? "Tu evidencia fue aprobada" : "Tu evidencia fue rechazada";
    const subject = `Evidencia ${aprobada ? "aprobada" : "rechazada"}: ${accion}`;
    const parrafos = [
        `Hola ${nombre}:`,
        `Revisamos la evidencia que enviaste para "${accion}" y ${aprobada ? "fue aprobada" : "no fue aceptada"}.`
    ];

    if (!aprobada) {
        parrafos.push(`Motivo: ${motivo}`);
    }

    const datos = [
        ["Acción", accion],
        ["Estado", aprobada ? "Aprobada" : "Rechazada"]
    ];

    if (aprobada) {
        datos.push(["Eco-Points sumados", String(puntos)]);
        datos.push(["Saldo actual", `${totalPuntos} Eco-Points`]);
        parrafos.push(`Sumaste ${puntos} Eco-Points. Tu saldo actual es de ${totalPuntos} Eco-Points.`);
    }

    const nota = aprobada
        ? disponibleDesde
            ? `Podés volver a enviar esta acción a partir del ${formatDate(disponibleDesde)}.`
            : "Podés volver a enviar esta acción cuando quieras."
        : "Podés corregir la evidencia y volver a enviarla desde la página de validación.";

    return {
        to,
        subject,
        text: `${parrafos.join("\n\n")}\n\n${nota}\n\n${SITE_URL}/validar\n\nEste correo se envió automáticamente. No respondas a este mensaje.`,
        html: layout({
            titulo,
            parrafos,
            datos,
            boton: {
                texto: aprobada ? "Ver mis acciones" : "Volver a enviar",
                url: `${SITE_URL}/validar`
            },
            nota,
            pie: "Este correo se envió automáticamente. No respondas a este mensaje."
        })
    };
};

const buildPurchaseEmail = ({
    to,
    nombre,
    curso,
    puntosUsados = 0,
    dinero = 0,
    moneda = "UYU",
    metodo = "free",
    totalPuntos = 0
}) => {
    const subject = `Curso desbloqueado: ${curso}`;
    const parrafos = [
        `Hola ${nombre}:`,
        `Ya tenés acceso al curso "${curso}".`
    ];

    if (dinero > 0) {
        parrafos.push(`El pago de ${formatMoney(dinero, moneda)} es simulado, igual que en el resto del proyecto.`);
    }

    const datos = [
        ["Curso", curso],
        ["Forma de pago", PAYMENT_LABELS[metodo] || metodo],
        ["Eco-Points usados", String(puntosUsados)]
    ];

    if (dinero > 0) datos.push(["Dinero", formatMoney(dinero, moneda)]);
    datos.push(["Saldo actual", `${totalPuntos} Eco-Points`]);

    return {
        to,
        subject,
        text: `${parrafos.join("\n\n")}\n\n${datos.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`).join("\n")}\n\nVer mis cursos: ${SITE_URL}/panel\n\nEste correo se envió automáticamente. No respondas a este mensaje.`,
        html: layout({
            titulo: "Curso desbloqueado",
            parrafos,
            datos,
            boton: { texto: "Ir a mis cursos", url: `${SITE_URL}/panel` },
            pie: "Este correo se envió automáticamente. No respondas a este mensaje."
        })
    };
};

const buildContactNotificationEmail = ({ to, nombre, apellido, correo, mensaje, fecha }) => {
    const remitente = `${nombre} ${apellido}`.trim();
    const subject = `Nuevo mensaje de contacto: ${remitente}`;
    const parrafos = [
        "Recibiste un mensaje nuevo desde el formulario de contacto de EcoCampus.",
        "Podés responder a este correo para contestarle directamente."
    ];
    const datos = [
        ["Nombre", remitente],
        ["Correo", correo],
        ["Fecha", formatDate(fecha)]
    ];

    return {
        to,
        replyTo: correo,
        subject,
        text: `${parrafos.join("\n\n")}\n\n${datos.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`).join("\n")}\n\nMensaje:\n${mensaje}\n\nVer la bandeja: ${SITE_URL}/admin`,
        html: layout({
            titulo: "Nuevo mensaje de contacto",
            parrafos,
            datos,
            cita: mensaje,
            boton: { texto: "Abrir la bandeja de mensajes", url: `${SITE_URL}/admin` },
            pie: "Este aviso se generó automáticamente desde el formulario de contacto de EcoCampus."
        })
    };
};

module.exports = {
    buildWelcomeEmail,
    buildSubmissionReviewedEmail,
    buildPurchaseEmail,
    buildContactNotificationEmail
};
