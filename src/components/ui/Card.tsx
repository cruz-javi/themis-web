import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function Card({ title, description, children }: CardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
