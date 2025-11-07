import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MeetingScheduler } from './MeetingScheduler';

interface Meeting {
  id: string;
  meeting_date: string;
  meeting_type: string;
  title: string;
  status: string;
  meeting_parts?: any[];
}

export const MeetingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, [currentDate]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_parts (*)
        `)
        .eq('user_id', userData.user.id)
        .gte('meeting_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('meeting_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('meeting_date');

      if (error) throw error;
      setMeetings(data || []);
    } catch (err) {
      console.error('Error loading meetings:', err);
      toast({
        title: 'Erro ao carregar reuniões',
        description: 'Não foi possível carregar o calendário de reuniões',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(new Date(meeting.meeting_date), date)
    );
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'regular_midweek': return 'bg-blue-500';
      case 'regular_weekend': return 'bg-green-500';
      case 'circuit_overseer_visit': return 'bg-purple-500';
      case 'special_event': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case 'regular_midweek': return 'Meio de Semana';
      case 'regular_weekend': return 'Fim de Semana';
      case 'circuit_overseer_visit': return 'Visita do SC';
      case 'special_event': return 'Evento Especial';
      default: return type;
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setShowScheduler(true);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  // Get days from previous month to fill the calendar
  const firstDayOfMonth = startOfMonth(currentDate).getDay();
  const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Calendário de Reuniões
              </CardTitle>
              <CardDescription>
                Visualize e gerencie as reuniões programadas
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                setShowScheduler(true);
              }}
              className="bg-jw-blue hover:bg-jw-blue-dark"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Reunião
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="text-center font-medium text-sm text-gray-600 p-2">
                {day}
              </div>
            ))}

            {/* Padding days */}
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`padding-${i}`} className="aspect-square"></div>
            ))}

            {/* Days */}
            {daysInMonth.map(day => {
              const dayMeetings = getMeetingsForDate(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    aspect-square border rounded-lg p-2 cursor-pointer hover:border-jw-blue transition-colors
                    ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}
                    ${isToday ? 'border-jw-blue border-2 bg-blue-50' : ''}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-sm font-medium ${isToday ? 'text-jw-blue' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                      {dayMeetings.slice(0, 2).map(meeting => (
                        <div
                          key={meeting.id}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate ${getMeetingTypeColor(meeting.meeting_type)}`}
                          title={meeting.title}
                        >
                          {getMeetingTypeLabel(meeting.meeting_type)}
                        </div>
                      ))}
                      {dayMeetings.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayMeetings.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium text-gray-700 mb-3">Legenda:</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm text-gray-600">Meio de Semana</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-sm text-gray-600">Fim de Semana</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                <span className="text-sm text-gray-600">Visita do SC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span className="text-sm text-gray-600">Evento Especial</span>
              </div>
            </div>
          </div>

          {/* Meeting Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {meetings.filter(m => m.meeting_type === 'regular_midweek').length}
              </p>
              <p className="text-sm text-gray-600">Meio de Semana</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {meetings.filter(m => m.meeting_type === 'regular_weekend').length}
              </p>
              <p className="text-sm text-gray-600">Fim de Semana</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {meetings.filter(m => m.meeting_type === 'circuit_overseer_visit').length}
              </p>
              <p className="text-sm text-gray-600">Visitas do SC</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {meetings.reduce((acc, m) => acc + (m.meeting_parts?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total de Partes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Scheduler Dialog */}
      <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar Reunião</DialogTitle>
          </DialogHeader>
          <MeetingScheduler
            initialDate={selectedDate || undefined}
            onClose={() => setShowScheduler(false)}
            onSave={() => {
              loadMeetings();
              setShowScheduler(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
