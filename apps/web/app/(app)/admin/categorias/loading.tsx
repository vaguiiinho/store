export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="surface h-40 animate-pulse rounded-[24px] motion-reduce:animate-none" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="surface h-20 animate-pulse rounded-[24px] motion-reduce:animate-none" />
      ))}
    </div>
  );
}
