import nodemailer from 'nodemailer';
import { SiteConfig } from '../models/SiteConfig.js';

/**
 * Email configuration interface
 */
interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpFrom: string;
  smtpFromName: string;
  quoteNotificationEmail?: string;
}

/**
 * Load SMTP configuration from database
 * Returns null if configuration is incomplete
 */
async function loadEmailConfig(): Promise<EmailConfig | null> {
  try {
    const configs = await SiteConfig.find({
      key: {
        $in: [
          'smtpHost',
          'smtpPort', 
          'smtpUsername',
          'smtpPassword',
          'smtpFrom',
          'smtpFromName',
          'quoteNotificationEmail'
        ]
      }
    });

    const configMap = new Map<string, string>();
    configs.forEach(config => {
      configMap.set(config.key, config.value);
    });

    const smtpHost = configMap.get('smtpHost');
    const smtpPort = configMap.get('smtpPort');
    const smtpUsername = configMap.get('smtpUsername');
    const smtpPassword = configMap.get('smtpPassword');
    const smtpFrom = configMap.get('smtpFrom');
    const smtpFromName = configMap.get('smtpFromName');
    const quoteNotificationEmail = configMap.get('quoteNotificationEmail');

    // Check if required fields are present
    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword || !smtpFrom || !smtpFromName) {
      console.warn('[Email] Incomplete SMTP configuration - email sending disabled');
      return null;
    }

    return {
      smtpHost,
      smtpPort: parseInt(smtpPort, 10),
      smtpUsername,
      smtpPassword,
      smtpFrom,
      smtpFromName,
      quoteNotificationEmail: quoteNotificationEmail || undefined
    };
  } catch (error) {
    console.error('[Email] Error loading email configuration:', error);
    return null;
  }
}

/**
 * Create nodemailer transport with configuration from database
 */
async function createTransporter() {
  const config = await loadEmailConfig();
  
  if (!config) {
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword,
      },
      // Security: Use TLS for ports other than 465
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates in development
      }
    });

    return { transporter, config };
  } catch (error) {
    console.error('[Email] Error creating email transporter:', error);
    return null;
  }
}

/**
 * Classify SMTP error for user-friendly messaging
 * Returns a user-friendly error message based on the error type
 */
function classifySmtpError(error: any): string {
  const errorMessage = error?.message || String(error);
  
  // Authentication errors
  if (errorMessage.includes('Invalid login') || 
      errorMessage.includes('authentication failed') ||
      errorMessage.includes('535') ||
      errorMessage.includes('530') ||
      errorMessage.includes('AUTH')) {
    return 'Errore di autenticazione SMTP: verifica username e password.';
  }
  
  // Connection errors
  if (errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('connection refused') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('getaddrinfo') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('ETIMEDOUT')) {
    return 'Impossibile connettersi al server SMTP: verifica host e porta.';
  }
  
  // TLS/SSL errors
  if (errorMessage.includes('TLS') ||
      errorMessage.includes('SSL') ||
      errorMessage.includes('certificate') ||
      errorMessage.includes('self-signed')) {
    return 'Errore di sicurezza SMTP: verifica configurazione TLS/SSL e porta.';
  }
  
  // Configuration errors
  if (errorMessage.includes('configuration') ||
      errorMessage.includes('incomplete') ||
      errorMessage.includes('missing')) {
    return 'Configurazione SMTP incompleta: verifica tutti i campi obbligatori.';
  }
  
  // Generic error
  return 'Errore nell\'invio dell\'email: verifica la configurazione SMTP.';
}

/**
 * Send email using configuration from database
 * This function is designed to fail gracefully - it won't throw exceptions
 * that would block the main application flow
 * 
 * Returns an object with success status and optional error message
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const transportConfig = await createTransporter();
    
    if (!transportConfig) {
      console.warn('[Email] Cannot send email - SMTP configuration incomplete or invalid');
      return { success: false, error: 'Configurazione SMTP incompleta o non valida.' };
    }

    const { transporter, config } = transportConfig;

    const mailOptions = {
      from: `"${config.smtpFromName}" <${config.smtpFrom}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    const errorMessage = classifySmtpError(error);
    console.error('[Email] Error sending email:', error);
    console.error('[Email] Classified error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send quote notification emails
 * Sends two emails:
 * 1. Detailed quote to farcomsrl@hotmail.com
 * 2. Notification to configured owner email (or fallback to farcomsrl@hotmail.com)
 */
export async function sendQuoteNotification(quoteData: {
  nome: string;
  cognome: string;
  azienda?: string;
  settore?: string;
  email: string;
  telefono?: string;
  data: string;
  metratura?: string;
  arredo?: string;
  messaggio?: string;
  note?: string;
}): Promise<{ detailedEmailSent: boolean; notificationEmailSent: boolean }> {
  const config = await loadEmailConfig();
  
  if (!config) {
    console.warn('[Email] Cannot send quote notifications - SMTP configuration incomplete');
    return { detailedEmailSent: false, notificationEmailSent: false };
  }

  const destinationEmail = 'farcomsrl@hotmail.com';
  const ownerEmail = config.quoteNotificationEmail || destinationEmail;

  // Email 1: Detailed quote to destination email
  const detailedSubject = `Nuovo preventivo da ${quoteData.nome} ${quoteData.cognome}`;
  const detailedText = `
Nuovo preventivo ricevuto dal sito web

DATI CLIENTE
------------
Nome: ${quoteData.nome}
Cognome: ${quoteData.cognome}
${quoteData.azienda ? `Azienda: ${quoteData.azienda}` : ''}
${quoteData.settore ? `Settore: ${quoteData.settore}` : ''}
Email: ${quoteData.email}
${quoteData.telefono ? `Telefono: ${quoteData.telefono}` : ''}

DETTAGLI PREVENTIVO
-------------------
Data preferita: ${quoteData.data}
${quoteData.metratura ? `Metratura: ${quoteData.metratura}` : ''}
${quoteData.arredo ? `Tipo arredo: ${quoteData.arredo}` : ''}

MESSAGGIO
---------
${quoteData.messaggio || 'Nessun messaggio'}

NOTE
----
${quoteData.note || 'Nessuna nota'}

---
Questo preventivo è stato inviato tramite il form del sito web Farcom Arredi.
`;

  const detailedHtml = `
<h2>Nuovo preventivo ricevuto dal sito web</h2>

<h3>DATI CLIENTE</h3>
<ul>
  <li><strong>Nome:</strong> ${quoteData.nome}</li>
  <li><strong>Cognome:</strong> ${quoteData.cognome}</li>
  ${quoteData.azienda ? `<li><strong>Azienda:</strong> ${quoteData.azienda}</li>` : ''}
  ${quoteData.settore ? `<li><strong>Settore:</strong> ${quoteData.settore}</li>` : ''}
  <li><strong>Email:</strong> ${quoteData.email}</li>
  ${quoteData.telefono ? `<li><strong>Telefono:</strong> ${quoteData.telefono}</li>` : ''}
</ul>

<h3>DETTAGLI PREVENTIVO</h3>
<ul>
  <li><strong>Data preferita:</strong> ${quoteData.data}</li>
  ${quoteData.metratura ? `<li><strong>Metratura:</strong> ${quoteData.metratura}</li>` : ''}
  ${quoteData.arredo ? `<li><strong>Tipo arredo:</strong> ${quoteData.arredo}</li>` : ''}
</ul>

<h3>MESSAGGIO</h3>
<p>${quoteData.messaggio || 'Nessun messaggio'}</p>

${quoteData.note ? `<h3>NOTE</h3><p>${quoteData.note}</p>` : ''}

<hr>
<p><em>Questo preventivo è stato inviato tramite il form del sito web Farcom Arredi.</em></p>
`;

  // Email 2: Notification to owner
  const notificationSubject = 'Avviso preventivo';
  const notificationText = 'Nuovo preventivo inviato. Controlla farcomsrl@hotmail.com';
  const notificationHtml = `<p>Nuovo preventivo inviato. Controlla <a href="mailto:farcomsrl@hotmail.com">farcomsrl@hotmail.com</a></p>`;

  // Send emails in parallel, don't await results (fire and forget)
  const detailedEmailPromise = sendEmail({
    to: destinationEmail,
    subject: detailedSubject,
    text: detailedText,
    html: detailedHtml
  });

  const notificationEmailPromise = sendEmail({
    to: ownerEmail,
    subject: notificationSubject,
    text: notificationText,
    html: notificationHtml
  });

  // Wait for both emails to complete (but don't block the main response)
  const [detailedEmailResult, notificationEmailResult] = await Promise.all([
    detailedEmailPromise,
    notificationEmailPromise
  ]);

  return {
    detailedEmailSent: detailedEmailResult.success,
    notificationEmailSent: notificationEmailResult.success
  };
}
