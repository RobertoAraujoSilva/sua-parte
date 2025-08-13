/**
 * Pending Students Panel
 * 
 * Component for instructors to review and approve/reject new student registrations
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, XCircle, Clock, User, Mail, Calendar } from 'lucide-react';

interface PendingRegistration {
    id: string;
    user_id: string;
    student_name: string;
    student_email: string;
    congregacao: string;
    student_data: {
        nome_completo: string;
        congregacao: string;
        cargo: string;
        date_of_birth: string;
        created_at: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export function PendingStudentsPanel() {
    const { user } = useAuth();
    const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (user?.id) {
            loadPendingRegistrations();
        }
    }, [user?.id]);

    const loadPendingRegistrations = async () => {
        try {
            setLoading(true);

            const { data, error } = await (supabase as any)
                .from('pending_student_registrations')
                .select('*')
                .eq('instructor_id', user?.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading pending registrations:', error);
                toast.error('Erro ao carregar solicitações pendentes');
                return;
            }

            setPendingRegistrations((data as PendingRegistration[]) || []);
        } catch (error) {
            console.error('Exception loading pending registrations:', error);
            toast.error('Erro ao carregar solicitações pendentes');
        } finally {
            setLoading(false);
        }
    };

    const approveRegistration = async (registrationId: string) => {
        if (!user?.id) return;

        setProcessingIds(prev => new Set(prev).add(registrationId));

        try {
            const { data, error } = await (supabase as any).rpc('approve_student_registration', {
                registration_id: registrationId,
                approver_id: user.id
            });

            if (error) {
                console.error('Error approving registration:', error);
                toast.error('Erro ao aprovar cadastro');
                return;
            }

            toast.success('Cadastro aprovado com sucesso!');
            loadPendingRegistrations(); // Reload the list
        } catch (error) {
            console.error('Exception approving registration:', error);
            toast.error('Erro ao aprovar cadastro');
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(registrationId);
                return newSet;
            });
        }
    };

    const rejectRegistration = async (registrationId: string, reason: string = '') => {
        if (!user?.id) return;

        setProcessingIds(prev => new Set(prev).add(registrationId));

        try {
            const { data, error } = await (supabase as any).rpc('reject_student_registration', {
                registration_id: registrationId,
                rejector_id: user.id,
                reason: reason || 'Não especificado'
            });

            if (error) {
                console.error('Error rejecting registration:', error);
                toast.error('Erro ao rejeitar cadastro');
                return;
            }

            toast.success('Cadastro rejeitado');
            loadPendingRegistrations(); // Reload the list
        } catch (error) {
            console.error('Exception rejecting registration:', error);
            toast.error('Erro ao rejeitar cadastro');
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(registrationId);
                return newSet;
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Estudantes Pendentes
                    </CardTitle>
                    <CardDescription>
                        Carregando solicitações de cadastro...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (pendingRegistrations.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Estudantes Pendentes
                    </CardTitle>
                    <CardDescription>
                        Não há solicitações de cadastro pendentes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Todas as solicitações foram processadas</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Estudantes Pendentes
                    <Badge variant="secondary">{pendingRegistrations.length}</Badge>
                </CardTitle>
                <CardDescription>
                    Solicitações de cadastro aguardando aprovação
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {pendingRegistrations.map((registration) => (
                    <div key={registration.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{registration.student_name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    {registration.student_email}
                                </div>
                            </div>
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Pendente
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Congregação:</span>
                                <p className="text-muted-foreground">{registration.congregacao}</p>
                            </div>
                            <div>
                                <span className="font-medium">Cargo:</span>
                                <p className="text-muted-foreground">{registration.student_data.cargo}</p>
                            </div>
                            <div>
                                <span className="font-medium">Idade:</span>
                                <p className="text-muted-foreground">
                                    {calculateAge(registration.student_data.date_of_birth)} anos
                                </p>
                            </div>
                            <div>
                                <span className="font-medium">Cadastrado em:</span>
                                <p className="text-muted-foreground">
                                    {formatDate(registration.created_at)}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectRegistration(registration.id)}
                                disabled={processingIds.has(registration.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                {processingIds.has(registration.id) ? 'Processando...' : 'Rejeitar'}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => approveRegistration(registration.id)}
                                disabled={processingIds.has(registration.id)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {processingIds.has(registration.id) ? 'Processando...' : 'Aprovar'}
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}