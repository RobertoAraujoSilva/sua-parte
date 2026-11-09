/** Official workbooks cover two months; select by date, not index position. */
export function workbookUrl(language: string, date = new Date()): string {
  const pt = ['janeiro-fevereiro', 'marco-abril', 'maio-junho', 'julho-agosto', 'setembro-outubro', 'novembro-dezembro'];
  const en = ['january-february', 'march-april', 'may-june', 'july-august', 'september-october', 'november-december'];
  const period = Math.floor(date.getUTCMonth() / 2);
  const base = language === 'en' ? 'en/library/jw-meeting-workbook' : 'pt/biblioteca/jw-apostila-do-mes';
  return `https://www.jw.org/${base}/${(language === 'en' ? en : pt)[period]}-${date.getUTCFullYear()}-mwb/`;
}

/** Preserve explicit years on weeks spanning December and January. */
export function periodWithYear(title: string, year: number): string {
  return /\b\d{4}\b/.test(title) ? title : `${title} ${year}`;
}