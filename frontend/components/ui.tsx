import type { ReactNode } from "react";

export function Section({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={dark ? "border-y border-[#34415e] bg-[#0d162b]/75" : ""}
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">{children}</div>
    </section>
  );
}

export function YellowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rotate-[-1deg] bg-yellow-400 px-4 py-2 text-sm font-black text-[#0b132b] shadow-lg">
      {children}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mb-14 max-w-3xl">
      <p className="mb-3 text-sm font-bold text-yellow-400">{eyebrow}</p>

      <h2 className="text-4xl font-black sm:text-5xl">{title}</h2>

      <p className="mt-4 text-lg leading-7 text-[#8d9ab4]">{text}</p>
    </div>
  );
}
