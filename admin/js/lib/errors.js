// Turns Supabase/Postgres/network errors into short Turkish messages for toasts and error states.

const BY_CODE = {
  '23505': 'Bu kimlik zaten kullanılıyor. Farklı bir kısa ad seç.',
  '23514': 'Bazı alanlar geçerli değil (biçim veya uzunluk).',
  '42501': 'Bu işlem için yetkin yok. Oturumunu yenileyip tekrar dene.',
  'PGRST301': 'Oturumun sona erdi. Lütfen yeniden giriş yap.',
  'invalid_credentials': 'E-posta veya şifre hatalı.',
  'email_not_confirmed': 'E-posta adresi henüz doğrulanmamış.',
  'over_request_rate_limit': 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.'
};

export class AppError extends Error {
  constructor(message, cause) { super(message); this.name = 'AppError'; this.cause = cause; }
}

export function friendlyError(err) {
  if (!err) return 'Bilinmeyen bir hata oluştu.';
  if (err instanceof AppError) return err.message;
  const code = err.code || err.error_code || (err.cause && err.cause.code);
  if (code && BY_CODE[code]) return BY_CODE[code];
  const msg = String(err.message || err.error_description || err);
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.';
  if (/JWT expired|invalid JWT/i.test(msg)) return BY_CODE.PGRST301;
  if (/row-level security/i.test(msg)) return BY_CODE['42501'];
  if (/quota|QuotaExceeded/i.test(msg)) return 'Tarayıcı depolama alanı doldu. Demo modunda daha küçük görseller kullan.';
  if (/Payload too large|exceeded the maximum allowed size/i.test(msg)) return 'Dosya çok büyük (en fazla 10 MB).';
  return msg;
}

/** Wraps an async call so callers get AppError with a friendly message. */
export async function guard(promise) {
  try { return await promise; } catch (e) { throw new AppError(friendlyError(e), e); }
}
