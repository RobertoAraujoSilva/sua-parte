import React from 'react';

export default function ProgramasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="programas-layout">
      {children}
    </div>
  );
}