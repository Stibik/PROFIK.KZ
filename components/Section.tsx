export function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-14 md:py-20 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow && <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent-400">{eyebrow}</div>}
      <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
      {sub && <p className="mt-3 text-steel-400">{sub}</p>}
    </div>
  );
}
