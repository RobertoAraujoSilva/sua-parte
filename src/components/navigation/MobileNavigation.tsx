import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation = ({ className = "" }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isInstrutor, isEstudante } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className={`lg:hidden ${className}`}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-jw-gold p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-jw-navy text-white border-jw-blue">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-jw-gold p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <nav className="space-y-4">
            {!user && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/')}
                >
                  {t('navigation.home')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/funcionalidades')}
                >
                  {t('navigation.features')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/congregacoes')}
                >
                  {t('navigation.congregations')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/suporte')}
                >
                  {t('navigation.support')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/sobre')}
                >
                  {t('navigation.about')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20 font-semibold"
                  onClick={() => handleNavigation('/doar')}
                >
                  {t('navigation.donate')}
                </Button>
              </>
            )}

            {isInstrutor && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/dashboard')}
                >
                  {t('navigation.dashboard')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/estudantes')}
                >
                  {t('navigation.students')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/admin/programas')}
                >
                  {t('navigation.programs')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/designacoes')}
                >
                  {t('navigation.assignments')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                  onClick={() => handleNavigation('/relatorios')}
                >
                  {t('navigation.reports')}
                </Button>
              </>
            )}

            {isEstudante && (
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:text-jw-gold hover:bg-jw-blue/20"
                onClick={() => handleNavigation(`/estudante/${user?.id}`)}
              >
                {t('navigation.myPortal')}
              </Button>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};