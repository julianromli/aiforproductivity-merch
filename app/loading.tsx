export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans animate-fade-in">
      {/* Header Skeleton */}
      <header className="px-8 py-6 border-b border-border animate-slide-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-5 w-16 bg-muted animate-pulse rounded" />
          </div>

          <nav className="hidden md:flex items-center space-x-12">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-3 w-12 bg-muted animate-pulse rounded"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
            <div className="h-8 w-20 bg-muted animate-pulse rounded border" />
          </nav>

          <div className="flex items-center space-x-6">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-16 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-8 w-20 bg-muted animate-pulse rounded border" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${300 + i * 150}ms` }}
              >
                <div className="relative w-full overflow-hidden mb-4">
                  <div className="w-full h-80 bg-muted animate-pulse rounded" />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-16 bg-muted animate-pulse rounded border" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Area Skeleton */}
      <div className="fixed bottom-8 right-8 z-40 animate-slide-up" style={{ animationDelay: "800ms" }}>
        <div className="border-2 border-dashed border-border bg-secondary p-8 text-center w-64">
          <div className="w-6 h-6 mx-auto mb-3 bg-muted animate-pulse rounded" />
          <div className="h-3 w-24 bg-muted animate-pulse rounded mx-auto mb-2" />
          <div className="h-2 w-32 bg-muted animate-pulse rounded mx-auto" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <footer
        className="border-t border-border px-8 py-16 bg-secondary animate-slide-up"
        style={{ animationDelay: "1000ms" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="h-4 w-16 bg-muted animate-pulse rounded opacity-30" />
          </div>
          <div className="h-3 w-64 bg-muted animate-pulse rounded mx-auto" />
        </div>
      </footer>
    </div>
  )
}
