export interface MWBProgram {
  week: string;
  date: string;
  theme: string;
  parts: {
    treasures: { title: string; time: string; reading?: string }[];
    ministry: { title: string; time: string; type: string }[];
    christianLife: { title: string; time: string; speaker?: string }[];
  };
}

export const parseMWBContent = (filename: string): MWBProgram[] => {
  // Extract month/year from filename (e.g., mwb_E_202507 = July 2025)
  const match = filename.match(/mwb_[ET]_(\d{4})(\d{2})/);
  if (!match) return [];
  
  const year = match[1];
  const month = match[2];
  
  // Generate sample program structure based on MWB format
  const programs: MWBProgram[] = [];
  const weeksInMonth = 4;
  
  for (let week = 1; week <= weeksInMonth; week++) {
    const weekDate = new Date(parseInt(year), parseInt(month) - 1, week * 7);
    
    programs.push({
      week: `${month}/${week}`,
      date: weekDate.toISOString().split('T')[0],
      theme: `Tema da Semana ${week} - ${getMonthName(parseInt(month))} ${year}`,
      parts: {
        treasures: [
          { title: "Tesouros da Palavra de Deus", time: "10 min", reading: "Leitura da Bíblia" }
        ],
        ministry: [
          { title: "Primeira Conversa", time: "3 min", type: "initial_call" },
          { title: "Revisita", time: "4 min", type: "return_visit" },
          { title: "Estudo Bíblico", time: "6 min", type: "bible_study" }
        ],
        christianLife: [
          { title: "Necessidades da Congregação", time: "15 min", speaker: "Ancião" },
          { title: "Estudo de A Sentinela", time: "30 min", speaker: "Ancião" }
        ]
      }
    });
  }
  
  return programs;
};

const getMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month - 1] || 'Mês';
};