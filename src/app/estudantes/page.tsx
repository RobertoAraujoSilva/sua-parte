'use client';

import { StudentsGridAG } from '@/components/students/StudentsGridAG';

export default function EstudantesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Estudantes</h1>
      <StudentsGridAG />
    </div>
  );
}
