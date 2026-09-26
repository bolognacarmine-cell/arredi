import rateLimit from 'express-rate-limit';

// Rate limiter per login endpoint - 20 richieste per 15 minuti per IP
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 20, // max 20 richieste per windowMs
  message: {
    success: false,
    message: 'Troppi tentativi di login. Riprova tra 15 minuti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
}) as any;

// Rate limiter per quote submissions - 5 richieste per ora per IP
export const quoteRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 5, // max 5 preventivi per ora
  message: {
    success: false,
    message: 'Troppe richieste di preventivo. Riprova tra un\'ora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
}) as any;

// Rate limiter per API admin generali - 100 richieste per 15 minuti
export const adminApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // max 100 richieste per 15 minuti
  message: {
    success: false,
    message: 'Troppe richieste API. Riprova tra qualche minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false,
}) as any;

// Rate limiter per GET lista preventivi admin - 500 richieste ogni 15 minuti per IP
export const quotesGetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 500, // max 500 letture per 15 minuti (pannello admin uso normale)
  message: {
    success: false,
    message: 'Troppe richieste di lettura preventivi. Riprova tra qualche minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false,
}) as any;