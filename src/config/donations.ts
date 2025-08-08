/**
 * Configuração centralizada de doações para o Sistema Ministerial
 * 
 * Este arquivo contém todas as informações necessárias para processar
 * doações via PIX, Wise e outros métodos de pagamento.
 */

export interface DonationConfig {
  pix: {
    key: string;
    emv: string;
    recipientName: string;
    recipientCity: string;
  };
  wise?: {
    link: string;
    enabled: boolean;
  };
  stripe?: {
    paymentLink: string;
    enabled: boolean;
  };
}

export const donationConfig: DonationConfig = {
  pix: {
    // Chave PIX do recebedor
    key: "f33c6c75-78ae-49ab-b6dd-6c552b24566e",
    
    // Código EMV completo para QR Code PIX
    emv: "00020126580014br.gov.bcb.pix0136f33c6c75-78ae-49ab-b6dd-6c552b24566e5204000053039865802BR5924MAURO FRANK LIMA DE LIMA6006MANAUS62070503***6304EAEC",
    
    // Nome do recebedor (extraído do EMV)
    recipientName: "MAURO FRANK LIMA DE LIMA",
    
    // Cidade do recebedor (extraído do EMV)
    recipientCity: "MANAUS"
  },
  
  // Configuração opcional para doações via Wise
  wise: {
    link: "https://wise.com/pay/me/maurof429",
    enabled: true
  },
  
  // Configuração opcional para doações via Stripe (quando disponível)
  stripe: {
    paymentLink: "", // Será preenchido quando o Payment Link estiver disponível
    enabled: false
  }
};

/**
 * Utilitários para trabalhar com as configurações de doação
 */
export const donationUtils = {
  /**
   * Copia texto para a área de transferência
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erro ao copiar para área de transferência:', error);
      return false;
    }
  },

  /**
   * Formata a chave PIX para exibição
   */
  formatPixKey: (key: string): string => {
    // Se for um UUID, mantém como está
    if (key.includes('-')) {
      return key;
    }
    // Se for email, mantém como está
    if (key.includes('@')) {
      return key;
    }
    // Se for telefone, formata
    if (key.length === 11) {
      return `(${key.slice(0, 2)}) ${key.slice(2, 7)}-${key.slice(7)}`;
    }
    // Se for CPF, formata
    if (key.length === 11) {
      return `${key.slice(0, 3)}.${key.slice(3, 6)}.${key.slice(6, 9)}-${key.slice(9)}`;
    }
    return key;
  },

  /**
   * Valida se o EMV é válido
   */
  isValidEmv: (emv: string): boolean => {
    return emv.startsWith('00020126') && emv.length > 50;
  }
};
