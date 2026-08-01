// Filtro simples de linguagem inadequada para bios e mensagens do Connect.
// Cobre os quatro idiomas suportados (PT / EN / IT / ES).

const BLOCKED_PATTERNS: RegExp[] = [
  // Português
  /\b(porra|caralh\w*|merda|fod[ae]\w*|puta|vagabund\w+|buceta|pinto|piroca|cuz[ãa]o|viado|safad[ao]|pelad[ao]|nudes?|transar|sexo|xoxota)\b/i,
  // Inglês
  /\b(fuck\w*|shit|bitch|whore|slut|dick|pussy|cunt|nudes?|horny|sexting|hookup|blowjob)\b/i,
  // Italiano
  /\b(cazz\w+|merda|troi[ae]|puttan\w+|stronz\w+|figa|scopare|nud[ao]|sesso)\b/i,
  // Espanhol
  /\b(joder|mierda|puta|zorra|polla|coño|cabr[oó]n|pendejo|desnud[ao]s?|follar|sexo)\b/i,
];

// Tentativas de levar a conversa para fora da área moderada não são bloqueadas,
// mas contatos diretos em texto livre são, para reduzir risco antes da confiança.
const CONTACT_PATTERNS: RegExp[] = [
  /\b\+?\d[\d\s().-]{8,}\b/, // telefone
  /\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/, // e-mail
];

export interface ContentCheck {
  ok: boolean;
  reason?: 'language' | 'contact';
}

export function checkContent(text: string): ContentCheck {
  const value = text.normalize('NFC');
  if (BLOCKED_PATTERNS.some((re) => re.test(value))) {
    return { ok: false, reason: 'language' };
  }
  if (CONTACT_PATTERNS.some((re) => re.test(value))) {
    return { ok: false, reason: 'contact' };
  }
  return { ok: true };
}

export function isCleanText(text: string): boolean {
  return checkContent(text).ok;
}
