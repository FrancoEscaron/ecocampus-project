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
