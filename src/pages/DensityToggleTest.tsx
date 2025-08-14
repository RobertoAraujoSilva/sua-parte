import React from 'react';
import PageShell from '@/components/layout/PageShell';
import DensityToggleTest from '@/components/tests/DensityToggleTest';
import { DensityToggleCompact } from '@/components/ui/density-toggle';

export default function DensityToggleTestPage() {
  return (
    <PageShell
      title="Teste de Densidade"
      hero={false}
      toolbar={
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Controles de Densidade:</span>
          </div>
          <div></div>
          <div></div>
          <div className="flex items-center gap-2">
            <DensityToggleCompact />
          </div>
        </>
      }
    >
      <DensityToggleTest />
    </PageShell>
  );
}