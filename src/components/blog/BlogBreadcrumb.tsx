import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  name: string
  href?: string
}

interface BlogBreadcrumbProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb "Home > Blog > Titolo" con markup <nav>/<ol> validato
 * da Google (aria-current sul nodo finale).
 */
export default function BlogBreadcrumb({ items }: BlogBreadcrumbProps) {
  return (
    <nav aria-label="Percorso di navigazione" className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
          {items.map((item, index) => {
            const last = index === items.length - 1
            return (
              <li key={`${item.name}-${index}`} className="flex items-center gap-2 min-w-0">
                {index > 0 && (
                  <span aria-hidden="true" className="text-[var(--muted-foreground)]">/</span>
                )}
                {item.href && !last ? (
                  <Link
                    to={item.href}
                    className="truncate hover:text-[#E69138] transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    aria-current={last ? 'page' : undefined}
                    className={last ? 'truncate text-[var(--foreground)] max-w-[50vw] sm:max-w-[320px]' : ''}
                    title={last ? item.name : undefined}
                  >
                    {item.name}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
