/** DS Skeleton: başvuru kartı iskeleti. */
export function CardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="ds-skel" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="ds-skel__card">
          <div className="ds-skel__row">
            <span className="ds-skel__avatar is-sm" />
            <span className="ds-skel__stack">
              <span className="ds-skel__line is-title w-[70%]" />
              <span className="ds-skel__line w-[45%]" />
            </span>
          </div>
          <span className="ds-skel__pill" />
          <span className="ds-skel__line w-[85%]" />
        </div>
      ))}
    </div>
  );
}
