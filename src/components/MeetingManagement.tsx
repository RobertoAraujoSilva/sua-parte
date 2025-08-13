import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Settings, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { 
  MEETING_TYPE_LABELS, 
  MEETING_STATUS_LABELS, 
  ADMINISTRATIVE_ROLE_LABELS,
  MeetingType,
  MeetingStatus 
} from '@/types/meetings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MeetingManagement = () => {
  const { 
    meetings, 
    administrativeAssignments, 
    specialEvents, 
    rooms,
    loading,
    checkMeetingCancellation,
    checkSpecialMeetingWeek 
  } = useMeetings();

  const [activeTab, setActiveTab] = useState('meetings');

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'postponed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingTypeColor = (type: MeetingType) => {
    switch (type) {
      case 'regular_midweek': return 'bg-blue-100 text-blue-800';
      case 'regular_weekend': return 'bg-green-100 text-green-800';
      case 'circuit_overseer_visit': return 'bg-purple-100 text-purple-800';
      case 'assembly_week': return 'bg-orange-100 text-orange-800';
      case 'convention_week': return 'bg-orange-100 text-orange-800';
      case 'memorial': return 'bg-red-100 text-red-800';
      case 'special_event': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpcomingMeetings = () => {
    const today = new Date();
    return meetings
      .filter(meeting => new Date(meeting.meeting_date) >= today)
      .slice(0, 5);
  };

  const getActiveSpecialEvents = () => {
    const today = new Date();
    return specialEvents.filter(event => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      return today >= startDate && today <= endDate;
    });
  };

  const getCurrentAdministrativeAssignments = () => {
    const today = new Date();
    return administrativeAssignments.filter(assignment => {
      const assignmentDate = new Date(assignment.assignment_date);
      return assignmentDate <= today;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jw-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema de reuniões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Reuniões</h1>
          <p className="text-gray-600 mt-2">
            Gerencie reuniões, eventos especiais e designações administrativas
          </p>
        </div>
        <Button className="bg-jw-blue hover:bg-jw-blue-dark">
          <Calendar className="w-4 h-4 mr-2" />
          Nova Reunião
        </Button>
      </div>

      {/* Active Special Events Alert */}
      {getActiveSpecialEvents().length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-orange-800">Eventos Especiais Ativos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getActiveSpecialEvents().map(event => (
                <div key={event.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-orange-800">{event.event_name}</p>
                    <p className="text-sm text-orange-600">
                      {format(new Date(event.start_date), 'dd/MM', { locale: ptBR })} - {' '}
                      {format(new Date(event.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    {event.event_type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meetings">Reuniões</TabsTrigger>
          <TabsTrigger value="assignments">Designações</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="rooms">Salas</TabsTrigger>
        </TabsList>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Meetings */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Próximas Reuniões
                </CardTitle>
                <CardDescription>
                  Reuniões agendadas para as próximas semanas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingMeetings().length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma reunião agendada
                    </p>
                  ) : (
                    getUpcomingMeetings().map(meeting => (
                      <div key={meeting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{meeting.title}</h3>
                              <Badge className={getMeetingTypeColor(meeting.meeting_type)}>
                                {MEETING_TYPE_LABELS[meeting.meeting_type]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(meeting.meeting_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                              {meeting.start_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {meeting.start_time}
                                </span>
                              )}
                            </div>
                            {meeting.description && (
                              <p className="text-sm text-gray-600 mt-2">{meeting.description}</p>
                            )}
                          </div>
                          <Badge className={getStatusColor(meeting.status || 'scheduled')}>
                            {MEETING_STATUS_LABELS[meeting.status || 'scheduled']}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de Reuniões</span>
                    <span className="font-medium">{meetings.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Eventos Especiais</span>
                    <span className="font-medium">{specialEvents.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Salas Ativas</span>
                    <span className="font-medium">{rooms.filter(r => r.is_active).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Designações Ativas</span>
                    <span className="font-medium">{getCurrentAdministrativeAssignments().length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Reunião
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Nova Designação
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Gerenciar Salas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Administrative Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Designações Administrativas
              </CardTitle>
              <CardDescription>
                Gerencie superintendentes, presidentes e conselheiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getCurrentAdministrativeAssignments().length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma designação administrativa ativa
                  </p>
                ) : (
                  getCurrentAdministrativeAssignments().map(assignment => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{assignment.estudante?.nome}</h3>
                          <p className="text-sm text-gray-600">
                            {ADMINISTRATIVE_ROLE_LABELS[assignment.role]}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Desde {format(new Date(assignment.assignment_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {assignment.estudante?.cargo}
                          </Badge>
                          {assignment.assigned_room && (
                            <p className="text-xs text-gray-500 mt-1">
                              {assignment.assigned_room}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Special Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Especiais</CardTitle>
              <CardDescription>
                Assembleias, congressos, visitas do superintendente de circuito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specialEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum evento especial cadastrado
                  </p>
                ) : (
                  specialEvents.map(event => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{event.event_name}</h3>
                          <p className="text-sm text-gray-600">{event.theme}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(event.start_date), 'dd/MM', { locale: ptBR })} - {' '}
                            {format(new Date(event.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-500">{event.location}</p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {event.event_type}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Salas</CardTitle>
              <CardDescription>
                Configure salas auxiliares e seus superintendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    Nenhuma sala cadastrada
                  </p>
                ) : (
                  rooms.map(room => (
                    <Card key={room.id} className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{room.room_name}</CardTitle>
                        <CardDescription>{room.room_type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Capacidade:</span>
                            <span>{room.capacity} pessoas</span>
                          </div>
                          {room.equipment_available && room.equipment_available.length > 0 && (
                            <div>
                              <span className="text-gray-600">Equipamentos:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {room.equipment_available.map((equipment, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {equipment}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingManagement;
