import { Router, Request, Response } from 'express';
import { RestoSudContact } from '../models/RestoSudContact.js';
import { contactRequestRateLimiter } from '../middleware/rateLimiter.js';
import { sendTelegramMessage } from '../utils/telegram.js';
import { sendEmail } from '../utils/email.js';

const router = Router();

const NOTIFICATION_EMAIL = 'farcomsrl@hotmail.com';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s.\-]{6,50}$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

router.post('/', contactRequestRateLimiter as any, async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};

  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const privacyConsent = body.privacyConsent === true;

  if (!fullName || fullName.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Inserisci nome e cognome.',
    });
  }

  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: 'Inserisci almeno un’email o un numero di telefono.',
    });
  }

  if (email && (email.length > 254 || !EMAIL_PATTERN.test(email))) {
    return res.status(400).json({
      success: false,
      message: 'Inserisci un indirizzo email valido.',
    });
  }

  if (phone && (phone.length > 50 || !PHONE_PATTERN.test(phone))) {
    return res.status(400).json({
      success: false,
      message: 'Inserisci un numero di telefono valido.',
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Il messaggio è troppo lungo. Massimo 2000 caratteri.',
    });
  }

  if (!privacyConsent) {
    return res.status(400).json({
      success: false,
      message: 'Per inviare la richiesta è necessario acconsentire al trattamento dei tuoi dati.',
    });
  }

  try {
    await RestoSudContact.create({
      fullName,
      email,
      phone,
      message,
      privacyConsent: true,
    });

    const safeFullName = fullName.replace(/[\r\n]+/g, ' ');
    const emailSubject = `Nuova richiesta Resto al Sud 2.0 - ${safeFullName}`;
    const emailText = [
      'Nuova richiesta Resto al Sud 2.0',
      '',
      `Nome e cognome: ${fullName}`,
      email ? `Email: ${email}` : '',
      phone ? `Telefono: ${phone}` : '',
      message ? `Messaggio: ${message}` : '',
      '',
      'Consenso privacy espresso',
    ]
      .filter(Boolean)
      .join('\n');

    const emailHtml = [
      '<h2>Nuova richiesta Resto al Sud 2.0</h2>',
      '<ul>',
      `<li><strong>Nome e cognome:</strong> ${escapeHtml(fullName)}</li>`,
      email ? `<li><strong>Email:</strong> ${escapeHtml(email)}</li>` : '',
      phone ? `<li><strong>Telefono:</strong> ${escapeHtml(phone)}</li>` : '',
      '</ul>',
      message ? `<h3>Messaggio</h3><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>` : '',
      '<p><em>Consenso privacy espresso.</em></p>',
    ]
      .filter(Boolean)
      .join('\n');

    void sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    })
      .then((result) => {
        if (!result.success) {
          console.error('[RestoSudContact] Email notification failed:', result.error || 'unknown error');
        }
      })
      .catch((error) => {
        console.error(
          '[RestoSudContact] Email notification error:',
          error instanceof Error ? error.message : String(error),
        );
      });

    const notification = [
      '🔔 <b>Nuova richiesta Resto al Sud 2.0</b>',
      '',
      `👤 <b>Nome e cognome:</b> ${escapeHtml(fullName)}`,
      email ? `📧 <b>Email:</b> ${escapeHtml(email)}` : '',
      phone ? `📱 <b>Telefono:</b> ${escapeHtml(phone)}` : '',
      message ? `💬 <b>Messaggio:</b>\n${escapeHtml(message)}` : '',
      '',
      '✅ Consenso privacy espresso',
    ]
      .filter(Boolean)
      .join('\n');

    void sendTelegramMessage(notification)
      .then((result) => {
        if (!result.success && process.env.NODE_ENV === 'development') {
          console.warn('[RestoSudContact] Telegram notification not sent');
        }
      })
      .catch(() => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[RestoSudContact] Telegram notification error');
        }
      });

    return res.status(201).json({ success: true });
  } catch {
    console.error('[RestoSudContact] Unable to save contact request');
    return res.status(500).json({
      success: false,
      message: 'Non è stato possibile inviare la richiesta. Riprova tra poco.',
    });
  }
});

export default router;
