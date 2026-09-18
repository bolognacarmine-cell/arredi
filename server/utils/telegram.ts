/**
 * Telegram notification utility
 * Sends automatic notifications to Telegram when new quotes are received
 */

/**
 * Send a message to Telegram via bot API
 * This function is designed to fail gracefully - it won't throw exceptions
 * that would block the main application flow
 * 
 * @param text - The message text to send
 * @returns Object with success status and optional error message
 */
export async function sendTelegramMessage(text: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Use environment variables if available, otherwise use hardcoded values for testing
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8762458733:AAFiYJ0jvtArqTNOa94XDObJQtQJezCkF40';
    const chatId = process.env.TELEGRAM_CHAT_ID || '8836121310';

    if (!botToken || !chatId) {
      console.warn('[Telegram] Cannot send message - TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured');
      return { success: false, error: 'Configurazione Telegram incompleta' };
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML', // Enable HTML formatting for better message formatting
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      const errorMessage = data.description || 'Unknown error';
      console.error('[Telegram] API error:', errorMessage);
      return { success: false, error: errorMessage };
    }

    console.log('[Telegram] Message sent successfully:', data.result?.message_id);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Telegram] Error sending message:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send a formatted quote notification to Telegram
 * @param quoteData - The quote data to include in the notification
 * @returns Object with success status and optional error message
 */
export async function sendQuoteTelegramNotification(quoteData: {
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
  id?: string;
}): Promise<{ success: boolean; error?: string }> {
  console.log('[Telegram] Preparing quote notification for:', quoteData.email);

  // Build the message with HTML formatting
  const message = `
🔔 <b>Nuovo Preventivo</b>

👤 <b>Cliente:</b> ${quoteData.nome} ${quoteData.cognome}
${quoteData.azienda ? `🏢 <b>Azienda:</b> ${quoteData.azienda}` : ''}
${quoteData.settore ? `🏭 <b>Settore:</b> ${quoteData.settore}` : ''}

📧 <b>Email:</b> ${quoteData.email}
${quoteData.telefono ? `📱 <b>Telefono:</b> ${quoteData.telefono}` : ''}

📅 <b>Data richiesta:</b> ${quoteData.data}
${quoteData.metratura ? `📐 <b>Metratura:</b> ${quoteData.metratura}` : ''}
${quoteData.arredo ? `🪑 <b>Arredo:</b> ${quoteData.arredo}` : ''}

${quoteData.messaggio ? `💬 <b>Messaggio:</b>\n${quoteData.messaggio}` : ''}
${quoteData.note ? `📝 <b>Note:</b>\n${quoteData.note}` : ''}

⏰ <b>Inviato:</b> ${new Date().toLocaleString('it-IT')}
  `.trim();

  return sendTelegramMessage(message);
}
