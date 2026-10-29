import { jobBenefits } from "../../data/benefits";
import type { Job } from "../../types";
import { Icon } from "../icons/Icon";
import { InfoChip } from "../ui/Chip";
import { Heading } from "../ui/Typography";

/** Kartta gösterilen en fazla yan hak; fazlası "+N yan hak" olarak özetlenir. */
const CARD_LIMIT = 3;

/** İlan kartındaki yan haklar: küçük ikonlu, satır kıran tek satırlık liste. Yan hak yoksa çizilmez. */
export function JobBenefits({ job }: { job: Job }) {
  const items = jobBenefits(job);
  if (!items.length) return null;
  const rest = items.length - CARD_LIMIT;
  return (
    <ul className="en-job__benefits" aria-label="Yan haklar">
      {items.slice(0, CARD_LIMIT).map((b) => (
        <li key={b.key} className="en-job__benefit">
          <Icon icon={b.icon} size={16} />
          <span className="en-job__benefit-label">{b.label}</span>
        </li>
      ))}
      {rest > 0 && <li className="en-job__benefit">{`+${rest} yan hak`}</li>}
    </ul>
  );
}

/** İlan detayındaki "Yan haklar" bölümü: tüm yan haklar, ilan özellikleriyle aynı bilgi çipleriyle. */
export function JobBenefitsSection({ job }: { job: Job }) {
  const items = jobBenefits(job);
  if (!items.length) return null;
  return (
    <section className="grid gap-8" data-testid="job-benefits">
      <Heading as="h3" look="title">
        Yan haklar
      </Heading>
      <ul className="en-job__meta" aria-label="Yan haklar">
        {items.map((b) => (
          <InfoChip key={b.key} icon={b.icon} label={b.label} />
        ))}
      </ul>
    </section>
  );
}
