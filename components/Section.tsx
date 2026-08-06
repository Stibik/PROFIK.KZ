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
  index,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  index?: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-5">
      {index && <span className="index-num mt-1 hidden text-5xl leading-none md:block md:text-6xl">{index}</span>}
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
        <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
        {sub && <p className="mt-3 text-steel-400">{sub}</p>}
      </div>
    </div>
  );
}
