export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-foreground">Socio Commerce</p>

            <p className="mt-1 text-sm text-muted-foreground">
              A modern social commerce experience.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2026 Socio Commerce. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
