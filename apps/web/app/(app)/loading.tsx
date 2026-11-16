export default function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="surface h-72 animate-pulse rounded-[28px] motion-reduce:animate-none" />
      ))}
    </div>
  );
}
