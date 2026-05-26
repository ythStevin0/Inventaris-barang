export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}) {
  return (
    <header className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-5">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
