export function Logo({
  className = "h-24 w-auto",
}: {
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="مطعم خميس — نابلس وجنين" className={`object-contain ${className}`} />
  );
}
