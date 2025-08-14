/**
 * FAQ Section Component for Sistema Ministerial Landing Page
 * 
 * Provides comprehensive answers to frequently asked questions organized by categories:
 * - Visão Geral (Overview)
 * - Cadastro de Estudantes (Student Registration)
 * - Leitura das Apostilas (Program Import)
 * - Algoritmo de Distribuição (Assignment Algorithm)
 * - Comunicação e Segurança (Communication & Security)
 * 
 * @component
 * @example
 * <FAQSection />
 */

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight,
  HelpCircle,
  Users,
  BookOpen,
  Settings,
  MessageSquare,
  Shield,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FAQ Item interface
 */
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
}

/**
 * FAQ Category interface
 */
interface FAQCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: FAQItem[];
}

/**
 * FAQ data organized by categories
 */
const faqData: FAQCategory[] = [
  {
    id: 'overview',
    title: 'Visão Geral',
    description: 'Informações gerais sobre o Sistema Ministerial',
    icon: HelpCircle,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    items: [
      {
        id: 'what-is-sistema',
        question: 'O que é o Sistema Ministerial?',
        answer: 'O Sistema Ministerial é uma plataforma digital completa desenvolvida especificamente para congregações das Testemunhas de Jeová. Ele automatiza todo o processo de designações da Escola do Ministério Teocrático, desde o cadastro de estudantes até a distribuição inteligente de partes, seguindo rigorosamente as diretrizes S-38-T.',
        tags: ['plataforma', 'automação', 'S-38-T']
      },
      {
        id: 'who-can-use',
        question: 'Quem pode usar o sistema?',
        answer: 'O sistema é destinado a instrutores da Escola do Ministério Teocrático, anciãos, servos ministeriais e coordenadores de congregação. Cada usuário tem acesso a funcionalidades específicas baseadas em seu cargo e responsabilidades na congregação.',
        tags: ['usuários', 'permissões', 'cargos']
      },
      {
        id: 'cost',
        question: 'Qual é o custo do sistema?',
        answer: 'O Sistema Ministerial é oferecido gratuitamente para todas as congregações. Mantemos o projeto através de doações voluntárias da comunidade, seguindo os princípios bíblicos de contribuição espontânea.',
        tags: ['gratuito', 'doações', 'custo']
      },
      {
        id: 'requirements',
        question: 'Quais são os requisitos técnicos?',
        answer: 'O sistema funciona em qualquer dispositivo com acesso à internet e navegador moderno (Chrome, Firefox, Safari, Edge). É totalmente responsivo, funcionando perfeitamente em computadores, tablets e smartphones.',
        tags: ['requisitos', 'navegador', 'dispositivos']
      }
    ]
  },
  {
    id: 'students',
    title: 'Cadastro de Estudantes',
    description: 'Gestão e organização de estudantes da escola',
    icon: Users,
    color: 'bg-green-50 text-green-700 border-green-200',
    items: [
      {
        id: 'add-students',
        question: 'Como cadastrar estudantes no sistema?',
        answer: 'Existem duas formas: cadastro individual através do formulário detalhado ou importação em lote via planilha Excel. O sistema valida automaticamente as informações e detecta duplicatas, garantindo a integridade dos dados.',
        tags: ['cadastro', 'importação', 'planilha']
      },
      {
        id: 'student-qualifications',
        question: 'Como definir as qualificações de cada estudante?',
        answer: 'O sistema possui um painel interativo onde você pode marcar as qualificações de cada estudante para diferentes tipos de designação (leitura da Bíblia, demonstrações, discursos). As regras S-38-T são aplicadas automaticamente baseadas no gênero e cargo.',
        tags: ['qualificações', 'S-38-T', 'designações']
      },
      {
        id: 'family-relationships',
        question: 'Como configurar relacionamentos familiares?',
        answer: 'No cadastro de cada estudante, você pode definir relacionamentos familiares (pai/mãe, cônjuge, filhos). Isso garante que pares de gêneros diferentes sejam formados apenas entre familiares, conforme as diretrizes organizacionais.',
        tags: ['família', 'relacionamentos', 'pares']
      },
      {
        id: 'student-progress',
        question: 'Como acompanhar o progresso dos estudantes?',
        answer: 'O sistema oferece um quadro Kanban interativo onde você pode mover estudantes entre níveis de progresso (Iniciante, Desenvolvimento, Qualificado, Avançado) usando arrastar-e-soltar. Também inclui estatísticas detalhadas e histórico de participação.',
        tags: ['progresso', 'kanban', 'estatísticas']
      }
    ]
  },
  {
    id: 'programs',
    title: 'Leitura das Apostilas',
    description: 'Importação e processamento de programas semanais',
    icon: BookOpen,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    items: [
      {
        id: 'import-pdf',
        question: 'Como importar programas a partir de PDFs?',
        answer: 'Basta fazer upload do PDF oficial da apostila "Nossa Vida e Ministério Cristão". O sistema usa tecnologia de OCR avançada para extrair automaticamente todas as partes, incluindo leituras da Bíblia, demonstrações e discursos, organizando tudo de forma estruturada.',
        tags: ['PDF', 'OCR', 'importação']
      },
      {
        id: 'manual-programs',
        question: 'Posso criar programas manualmente?',
        answer: 'Sim! Para casos especiais ou quando o PDF não está disponível, você pode criar programas manualmente usando nosso editor intuitivo. Todas as validações S-38-T são aplicadas automaticamente.',
        tags: ['manual', 'editor', 'criação']
      },
      {
        id: 'program-validation',
        question: 'Como o sistema valida os programas importados?',
        answer: 'O sistema verifica automaticamente se todas as partes foram identificadas corretamente, valida os tipos de designação e alerta sobre possíveis inconsistências. Você pode revisar e ajustar antes de gerar as designações.',
        tags: ['validação', 'verificação', 'consistência']
      },
      {
        id: 'special-weeks',
        question: 'Como lidar com semanas especiais (assembleia, visita do superintendente)?',
        answer: 'O sistema possui configurações especiais para semanas de assembleia, convenção, visita do superintendente de circuito e Memorial. Você pode facilmente cancelar ou modificar programas para essas ocasiões especiais.',
        tags: ['assembleia', 'superintendente', 'especiais']
      }
    ]
  },
  {
    id: 'algorithm',
    title: 'Algoritmo de Distribuição',
    description: 'Como funciona a distribuição inteligente de designações',
    icon: Settings,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    items: [
      {
        id: 'how-algorithm-works',
        question: 'Como funciona o algoritmo de distribuição?',
        answer: 'O algoritmo considera múltiplos fatores: qualificações individuais, histórico das últimas 8 semanas, balanceamento de participação, relacionamentos familiares e regras S-38-T. Ele garante distribuição equitativa e conformidade total com as diretrizes organizacionais.',
        tags: ['algoritmo', 'balanceamento', 'histórico']
      },
      {
        id: 'assignment-rules',
        question: 'Quais regras S-38-T são aplicadas automaticamente?',
        answer: 'Todas as regras principais: Parte 3 (Leitura da Bíblia) apenas para homens, discursos apenas para homens qualificados, pares de gêneros diferentes apenas entre familiares, e distribuição adequada baseada na experiência de cada estudante.',
        tags: ['S-38-T', 'regras', 'gênero']
      },
      {
        id: 'regenerate-assignments',
        question: 'Posso regenerar as designações se não gostar do resultado?',
        answer: 'Sim! Você pode regenerar as designações quantas vezes quiser. O algoritmo criará uma nova distribuição mantendo as mesmas regras e critérios de balanceamento. Também é possível fazer ajustes manuais específicos.',
        tags: ['regeneração', 'ajustes', 'flexibilidade']
      },
      {
        id: 'balancing-participation',
        question: 'Como o sistema garante participação equilibrada?',
        answer: 'O algoritmo rastreia a participação de cada estudante nas últimas 8 semanas e prioriza aqueles que participaram menos recentemente. Também considera o tipo de designação para garantir variedade na experiência de cada estudante.',
        tags: ['balanceamento', 'participação', 'variedade']
      }
    ]
  },
  {
    id: 'communication',
    title: 'Comunicação e Segurança',
    description: 'Notificações, privacidade e segurança dos dados',
    icon: MessageSquare,
    color: 'bg-red-50 text-red-700 border-red-200',
    items: [
      {
        id: 'notifications',
        question: 'Como funcionam as notificações automáticas?',
        answer: 'O sistema envia notificações por email automaticamente quando as designações são geradas. As notificações incluem todos os detalhes: data, parte, cena, instruções específicas e material de estudo. Integração com WhatsApp está em desenvolvimento.',
        tags: ['notificações', 'email', 'WhatsApp']
      },
      {
        id: 'data-security',
        question: 'Como meus dados estão protegidos?',
        answer: 'Utilizamos criptografia de ponta a ponta, autenticação segura, backups automáticos e servidores certificados. Todos os dados ficam protegidos e apenas usuários autorizados têm acesso às informações da congregação.',
        tags: ['segurança', 'criptografia', 'privacidade']
      },
      {
        id: 'student-portal',
        question: 'Os estudantes têm acesso ao sistema?',
        answer: 'Sim! Existe um portal específico para estudantes onde eles podem visualizar suas designações, confirmar participação, acessar material de estudo e contribuir com doações. O acesso é controlado e limitado às informações relevantes.',
        tags: ['portal', 'estudantes', 'acesso']
      },
      {
        id: 'backup-recovery',
        question: 'E se eu perder meus dados?',
        answer: 'Todos os dados são automaticamente salvos na nuvem com backups diários. Em caso de problemas, podemos recuperar informações de até 30 dias. Também oferecemos exportação de dados para backup local.',
        tags: ['backup', 'recuperação', 'nuvem']
      }
    ]
  }
];

/**
 * FAQ Section Component
 */
const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');

  /**
   * Toggle FAQ item open/closed state
   */
  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  /**
   * Filter FAQ items based on search term
   */
  const filteredCategories = faqData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  const currentCategory = filteredCategories.find(cat => cat.id === selectedCategory) || filteredCategories[0];

  return (
    <section id="faq" className="py-20 bg-muted/30 overflow-x-hidden">
      <div className="responsive-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-balance text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-foreground mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-balance text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder={t('faq.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-jw-blue focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('faq.categories')}</h3>
              <div className="space-y-2">
                {filteredCategories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3",
                        isSelected
                          ? "bg-jw-blue text-white shadow-md"
                          : "bg-background hover:bg-muted border border-border hover:border-jw-blue/30"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{category.title}</div>
                        <div className={cn(
                          "text-xs",
                          isSelected ? "text-white/80" : "text-muted-foreground"
                        )}>
                          {category.items.length} {category.items.length === 1 ? t('faq.question') : t('faq.questions')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {currentCategory && (
              <div>
                {/* Category Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("p-2 rounded-lg", currentCategory.color)}>
                      <currentCategory.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {currentCategory.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {currentCategory.description}
                  </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                  {currentCategory.items.map((item) => {
                    const isOpen = openItems.has(item.id);
                    
                    return (
                      <Card key={item.id} className="border-border/50 hover:border-jw-blue/30 transition-all duration-200">
                        <Collapsible open={isOpen} onOpenChange={() => toggleItem(item.id)}>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-foreground text-left">
                                  {item.question}
                                </CardTitle>
                                {isOpen ? (
                                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <p className="text-muted-foreground leading-relaxed mb-4">
                                {item.answer}
                              </p>
                              {item.tags && (
                                <div className="flex flex-wrap gap-2">
                                  {item.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>

                {/* No Results */}
                {currentCategory.items.length === 0 && searchTerm && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t('faq.noResults')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('faq.tryOtherTerms')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto border-jw-blue/20 bg-gradient-to-r from-jw-blue/5 to-jw-navy/5">
            <CardContent className="p-8">
              <Shield className="w-12 h-12 text-jw-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('faq.needHelp')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('faq.supportTeam')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/suporte"
                  className="inline-flex items-center justify-center px-6 py-3 bg-jw-blue text-white rounded-lg hover:bg-jw-blue/90 transition-colors font-medium"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('faq.contact')}
                </a>
                <a
                  href="#funcionalidades"
                  className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t('faq.viewFeatures')}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
