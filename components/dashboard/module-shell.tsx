import type { ReactNode } from "react";

type ModuleShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

export function ModuleShell({ eyebrow, title, description, action, children }: ModuleShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-racing-red">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-normal text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56 md:text-base">
            {description}
          </p>
        </div>
        <div>
        {action}
        </div>
      </div>
      {children}
    </section>
  );
}
