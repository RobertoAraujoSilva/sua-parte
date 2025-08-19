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
 * FAQ Section Component
 */
const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');

  /**
   * FAQ data organized by categories - using translations
   */
  const faqData: FAQCategory[] = [
    {
      id: 'overview',
      title: t('faq.categoryTitlesHardcoded.overview'),
      description: t('faq.categoryDescriptions.overview'),
      icon: HelpCircle,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      items: [
        {
          id: 'what-is-sistema',
          question: t('faq.questions.whatIs'),
          answer: t('faq.answers.whatIs'),
          tags: ['plataforma', 'automação', 'S-38-T']
        },
        {
          id: 'who-can-use',
          question: t('faq.questions.whoCanUse'),
          answer: t('faq.answers.whoCanUse'),
          tags: ['usuários', 'permissões', 'cargos']
        },
        {
          id: 'cost',
          question: t('faq.questions.cost'),
          answer: t('faq.answers.cost'),
          tags: ['gratuito', 'doações', 'custo']
        },
        {
          id: 'requirements',
          question: t('faq.questions.requirements'),
          answer: t('faq.answers.requirements'),
          tags: ['requisitos', 'navegador', 'dispositivos']
        }
      ]
    },
    {
      id: 'students',
      title: t('faq.categoryTitlesHardcoded.students'),
      description: t('faq.categoryDescriptions.students'),
      icon: Users,
      color: 'bg-green-50 text-green-700 border-green-200',
      items: [
        {
          id: 'placeholder1',
          question: t('faqHardcoded.comingSoon'),
          answer: t('faqHardcoded.moreQuestions'),
          tags: []
        }
      ]
    },
    {
      id: 'programs',
      title: t('faq.categoryTitlesHardcoded.programs'),
      description: t('faq.categoryDescriptions.programs'),
      icon: BookOpen,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      items: [
        {
          id: 'placeholder2',
          question: t('faqHardcoded.comingSoon'),
          answer: t('faqHardcoded.moreQuestions'),
          tags: []
        }
      ]
    },
    {
      id: 'algorithm',
      title: t('faq.categoryTitlesHardcoded.algorithm'),
      description: t('faq.categoryDescriptions.algorithm'),
      icon: Settings,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      items: [
        {
          id: 'placeholder3',
          question: t('faqHardcoded.comingSoon'),
          answer: t('faqHardcoded.moreQuestions'),
          tags: []
        }
      ]
    },
    {
      id: 'communication',
      title: t('faq.categoryTitlesHardcoded.communication'),
      description: t('faq.categoryDescriptions.communication'),
      icon: MessageSquare,
      color: 'bg-red-50 text-red-700 border-red-200',
      items: [
        {
          id: 'placeholder4',
          question: t('faqHardcoded.comingSoon'),
          answer: t('faqHardcoded.moreQuestions'),
          tags: []
        }
      ]
    }
  ];

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

  // Translate FAQ data
  const translatedFaqData = faqData.map(category => ({
    ...category,
    title: t(category.title),
    description: t(category.description),
    items: category.items.map(item => ({
      ...item,
      question: t(item.question),
      answer: t(item.answer),
      tags: item.tags?.map(tag => t(tag))
    }))
  }));

  /**
   * Filter FAQ items based on search term
   */
  const filteredCategories = translatedFaqData.map(category => ({
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
                          {category.items.length} {category.items.length === 1 ? t('faqHardcoded.question') : t('faqHardcoded.questions')}
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
