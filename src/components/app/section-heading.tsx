import Link from "next/link";

export function SectionHeading({ title, moreHref }: { title: string; moreHref?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-body font-bold text-ink">{title}</h2>
      {moreHref === undefined ? null : (
        <Link href={moreHref} className="text-small font-bold text-violet-500">
          See all
        </Link>
      )}
    </div>
  );
}
