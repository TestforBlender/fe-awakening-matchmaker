import type { ReactNode } from 'react';

/** A labelled content block with a small uppercase gold heading. Spacing is
 *  owned by the parent container so this stays layout-neutral. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-goldtext">
        {title}
      </h3>
      {children}
    </div>
  );
}
