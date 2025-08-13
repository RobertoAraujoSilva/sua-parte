/**
 * Programas Navigation Button
 * 
 * Button component for navigating to the programs page from dashboard
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProgramasNavButtonProps {
  totalPrograms?: number;
  thisMonthPrograms?: number;
  variant?: 'button' | 'card';
}

export function ProgramasNavButton({
  totalPrograms,
  thisMonthPrograms,
  variant = 'button'
}: ProgramasNavButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/programas');
  };

  if (variant === 'card') {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Programas
          </CardTitle>
          <CardDescription>
            Gerencie os programas da congregação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {totalPrograms !== undefined && (
                <p className="text-2xl font-bold">{totalPrograms}</p>
              )}
              {thisMonthPrograms !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {thisMonthPrograms} este mês
                </p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button onClick={handleClick} className="flex items-center gap-2">
      <CalendarDays className="h-4 w-4" />
      Programas
      {totalPrograms !== undefined && (
        <span className="ml-1 px-2 py-1 bg-white/20 rounded text-xs">
          {totalPrograms}
        </span>
      )}
    </Button>
  );
}