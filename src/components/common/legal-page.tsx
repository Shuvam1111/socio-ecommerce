import Link from 'next/link';

import type { LegalContent, LegalDocument } from '@/types/legal';

type LegalPageProps = {
  readonly document: LegalDocument;
};

function ContentBlock({ content }: { readonly content: LegalContent }) {
  if (content.type === 'paragraph') {
    return <p className="text-[15px] leading-7 text-muted-foreground">{content.text}</p>;
  }

  if (content.type === 'bullets') {
    return (
      <ul className="ml-5 list-disc space-y-2.5 text-[15px] leading-7 text-muted-foreground">
        {content.items.map((item) => (
          <li key={item} className="pl-1">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (content.type === 'numbered') {
    return (
      <ol className="ml-5 list-decimal space-y-2.5 text-[15px] leading-7 text-muted-foreground">
        {content.items.map((item) => (
          <li key={item} className="pl-1">
            {item}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <p className="text-sm font-semibold text-foreground">{content.title}</p>

      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{content.text}</p>
    </div>
  );
}

export function LegalPage({ document }: LegalPageProps) {
  return (
    <main className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Legal & Compliance
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {document.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {document.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>
                Last updated:{' '}
                <strong className="font-medium text-foreground">{document.lastUpdated}</strong>
              </span>

              <span className="hidden h-4 w-px bg-border sm:block" />

              <span>Effective immediately</span>
            </div>
          </div>
        </div>
      </section>

      {/* Document */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:py-14">
        {/* Table of contents */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On this page
            </p>

            <nav className="mt-4">
              <ul className="space-y-1">
                {document.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <article className="min-w-0 max-w-3xl">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
            {document.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 border-b border-border py-8 first:pt-0 last:border-b-0 last:pb-0"
              >
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{section.title}</h2>

                {section.content && (
                  <div className="mt-5 space-y-4">
                    {section.content.map((content, index) => (
                      <ContentBlock key={`${section.id}-${index}`} content={content} />
                    ))}
                  </div>
                )}

                {section.subsections && (
                  <div className="mt-7 space-y-8">
                    {section.subsections.map((subsection) => (
                      <div key={subsection.id}>
                        <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                          {subsection.title}
                        </h3>

                        <div className="mt-3 space-y-4">
                          {subsection.content.map((content, index) => (
                            <ContentBlock key={`${subsection.id}-${index}`} content={content} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {document.contact && (
              <div className="mt-10 rounded-lg border border-border bg-muted/40 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Contact
                </p>

                <h2 className="mt-2 text-xl font-semibold">Questions about this policy?</h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Our team is available to help with privacy and compliance-related questions.
                </p>

                <div className="mt-5 space-y-2 text-sm">
                  <p className="font-medium">{document.contact.company}</p>

                  <p>
                    Email:{' '}
                    <Link
                      href={`mailto:${document.contact.email}`}
                      className="text-primary hover:underline"
                    >
                      {document.contact.email}
                    </Link>
                  </p>

                  {document.contact.phone && <p>Phone: {document.contact.phone}</p>}

                  {document.contact.address && <p>Address: {document.contact.address}</p>}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
