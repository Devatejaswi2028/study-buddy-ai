export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-floaty absolute -top-40 -left-24 h-[520px] w-[520px] rounded-full bg-primary/25 blur-[120px]" />
      <div className="animate-floaty-slow absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full bg-accent/15 blur-[130px]" />
      <div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-primary/10 blur-[120px]" />
    </div>
  );
}
