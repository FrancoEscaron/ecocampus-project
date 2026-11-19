const nodemailer = require("nodemailer");

const readPort = () => {
    const port = Number(process.env.SMTP_PORT);
    return Number.isFinite(port) && port > 0 ? port : 587;
};

const isSecure = () => {
    if (process.env.SMTP_SECURE === "true") return true;
    if (process.env.SMTP_SECURE === "false") return false;
    return readPort() === 465;
};

const hasSmtpConfig = () =>
    Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const hasApiConfig = () =>
    Boolean(process.env.MAILTRAP_API_TOKEN && process.env.MAILTRAP_INBOX_ID);

const parseRemitente = (valor) => {
    const texto = String(valor || "").trim();
    const coincidencia = texto.match(/^(.*)<([^>]+)>$/);

    if (coincidencia) {
        return {
            name: coincidencia[1].trim().replace(/^"|"$/g, ""),
            email: coincidencia[2].trim()
        };
    }

    return { email: texto };
};

const enviarPorApi = async ({ to, subject, text, html, replyTo }) => {
    const respuesta = await fetch(
        `https://sandbox.api.mailtrap.io/api/send/${encodeURIComponent(process.env.MAILTRAP_INBOX_ID)}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.MAILTRAP_API_TOKEN}`
            },
            body: JSON.stringify({
                from: parseRemitente(getFrom()),
                to: [{ email: to }],
                subject,
                text,
                html,
                reply_to: replyTo ? { email: replyTo } : undefined
            }),
            signal: AbortSignal.timeout(15000)
        }
    );

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        const motivo = (Array.isArray(datos?.errors) && datos.errors.join(" "))
            || datos?.message
            || `HTTP ${respuesta.status}`;
        throw new Error(motivo);
    }

    const ids = Array.isArray(datos?.message_ids) ? datos.message_ids : [];
    return ids[0] || "api";
};

let transporte = null;

const getTransporte = () => {
    if (!hasSmtpConfig()) return null;
    if (!transporte) {
        transporte = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: readPort(),
            secure: isSecure(),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
        });
    }
    return transporte;
};

const getFrom = () =>
    process.env.MAIL_FROM || process.env.SMTP_USER || "no-responder@ecocampus.local";

const sendMail = async ({ to, subject, text, html, replyTo }) => {
    if (!to) return { sent: false, reason: "sin destinatario" };

    const asunto = String(subject || "").replace(/[\r\n]+/g, " ").trim();

    if (hasApiConfig()) {
        try {
            const messageId = await enviarPorApi({ to, subject: asunto, text, html, replyTo });
            console.log(`[correo] Enviado a ${to} (${messageId})`);
            return { sent: true, messageId };
        } catch (error) {
            console.error(`[correo] No se pudo enviar a ${to}: ${error.message}`);
            return { sent: false, error: error.message };
        }
    }

    const transporteActual = getTransporte();

    if (!transporteActual) {
        console.log(`[correo simulado] Para: ${to}\nAsunto: ${asunto}\n\n${text}\n`);
        return { sent: false, simulated: true };
    }

    try {
        const info = await transporteActual.sendMail({
            from: getFrom(),
            to,
            subject: asunto,
            text,
            html,
            replyTo
        });
        console.log(`[correo] Enviado a ${to} (${info.messageId})`);
        return { sent: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[correo] No se pudo enviar a ${to}: ${error.message}`);
        return { sent: false, error: error.message };
    }
};

const getEsperaEntreEnvios = () => {
    const configurada = (process.env.MAIL_MIN_GAP_MS || "").trim();

    if (configurada !== "") {
        const valor = Number(configurada);
        if (Number.isFinite(valor) && valor >= 0) return valor;
    }

    if (hasApiConfig()) return 10500;

    const host = String(process.env.SMTP_HOST || "").toLowerCase();
    return host.includes("mailtrap") ? 10500 : 1100;
};

const ESPERA_REINTENTO = 10000;
const REINTENTOS_MAXIMOS = 2;

let cola = Promise.resolve();
let ultimoIntento = 0;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const enviarConEspera = async (payload) => {
    const espera = getEsperaEntreEnvios();
    const desdeUltimo = Date.now() - ultimoIntento;

    if (desdeUltimo < espera) {
        await esperar(espera - desdeUltimo);
    }

    for (let intento = 0; intento <= REINTENTOS_MAXIMOS; intento += 1) {
        const resultado = await sendMail(payload);
        ultimoIntento = Date.now();

        const error = String(resultado.error || "").toLowerCase();
        const puedeReintentar = !resultado.sent
            && !resultado.simulated
            && error.includes("too many emails")
            && intento < REINTENTOS_MAXIMOS;

        if (!puedeReintentar) return resultado;

        await esperar(ESPERA_REINTENTO);
    }

    return { sent: false, error: "No se pudo enviar después de varios intentos." };
};

const notify = (mensaje) => {
    cola = cola
        .then(() => {
            const payload = typeof mensaje === "function" ? mensaje() : mensaje;
            return enviarConEspera(payload);
        })
        .catch((error) => {
            console.error(`[correo] Error inesperado: ${error.message}`);
        });
};

module.exports = { sendMail, notify, hasSmtpConfig };
