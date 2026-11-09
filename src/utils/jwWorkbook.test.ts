import { describe, it, expect } from 'vitest';
import { workbookUrl, periodWithYear } from '../../supabase/functions/firecrawl-jworg/workbook';
import { inicioDoPeriodo } from './programacaoDates';

describe('Official meeting periods', () => {
  it('selects November 2026 even when the index advertises 2027', () => {
    expect(workbookUrl('pt', new Date('2026-11-09T01:00:00Z'))).toBe('https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/novembro-dezembro-2026-mwb/');
  });
  it('advances to the next published period in January', () => {
    expect(workbookUrl('pt', new Date('2027-01-04T01:00:00Z'))).toBe('https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/janeiro-fevereiro-2027-mwb/');
  });
  it('includes the year needed to select the current week', () => {
    expect(periodWithYear('9-15 de novembro', 2026)).toBe('9-15 de novembro 2026');
  });
  it('keeps the starting year on a week crossing New Year', () => {
    const period = periodWithYear('28 de dezembro de 2026–3 de janeiro de 2027', 2026);
    const date = inicioDoPeriodo(period);
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(11);
    expect(date?.getDate()).toBe(28);
  });
});