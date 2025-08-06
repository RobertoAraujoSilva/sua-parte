import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FamilyMemberFormData,
  relationOptions,
  genderOptions,
  formatPhone,
  validatePhone,
  FamilyMember
} from '@/types/family';

// Validation schema
const familyMemberSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone === '') return true;
      return validatePhone(phone);
    }, 'Formato de telefone inválido. Use formato brasileiro (XX) XXXXX-XXXX ou internacional +44 XXXX XXXXXX'),
  gender: z.enum(['M', 'F'], { required_error: 'Selecione o gênero' }),
  relation: z.enum(['Pai', 'Mãe', 'Cônjuge', 'Filho', 'Filha', 'Irmão', 'Irmã'], { 
    required_error: 'Selecione o parentesco' 
  }),
}).refine((data) => {
  // At least email or phone must be provided
  return data.email || data.phone;
}, {
  message: 'Informe pelo menos um email ou telefone para envio de convites',
  path: ['email'], // Show error on email field
});

interface FamilyMemberFormProps {
  onSubmit: (data: FamilyMemberFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: FamilyMember;
  isLoading?: boolean;
  title?: string;
}

export const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  title = 'Adicionar Familiar'
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      gender: initialData?.gender || undefined,
      relation: initialData?.relation || undefined,
    }
  });

  const watchedRelation = watch('relation');
  const watchedGender = watch('gender');

  // Auto-set gender based on relation
  useEffect(() => {
    if (watchedRelation) {
      const relationOption = relationOptions.find(opt => opt.value === watchedRelation);
      if (relationOption?.gender && relationOption.gender !== watchedGender) {
        setValue('gender', relationOption.gender);
      }
    }
  }, [watchedRelation, watchedGender, setValue]);

  // Format phone number on blur
  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue('phone', formatted);
  };

  const handleFormSubmit = async (data: FamilyMemberFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        reset(); // Only reset if adding new (not editing)
      }
    } catch (error) {
      console.error('Error submitting family member form:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-jw-blue">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Digite o nome completo"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Relationship Field */}
          <div className="space-y-2">
            <Label htmlFor="relation">Parentesco *</Label>
            <Select
              value={watch('relation') || ''}
              onValueChange={(value) => setValue('relation', value as any)}
            >
              <SelectTrigger className={errors.relation ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o parentesco" />
              </SelectTrigger>
              <SelectContent>
                {relationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relation && (
              <p className="text-sm text-red-600">{errors.relation.message}</p>
            )}
          </div>

          {/* Gender Field */}
          <div className="space-y-3">
            <Label>Gênero *</Label>
            <RadioGroup
              value={watch('gender') || ''}
              onValueChange={(value) => setValue('gender', value as any)}
              className="flex space-x-6"
            >
              {genderOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {errors.gender && (
              <p className="text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="exemplo@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="(11) 99999-9999 ou +44 7386 797715"
              onBlur={handlePhoneBlur}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Contact Info Alert */}
          <Alert>
            <AlertDescription>
              <strong>Importante:</strong> Informe pelo menos um email ou telefone para que seja possível enviar convites de acesso ao sistema.
              <br />
              <strong>Telefones aceitos:</strong> Formato brasileiro (11) 99999-9999 ou internacional +44 7386 797715
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="bg-jw-blue hover:bg-jw-blue/90"
            >
              {isSubmitting || isLoading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Adicionar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
