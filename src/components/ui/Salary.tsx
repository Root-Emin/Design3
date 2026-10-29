import { formatTL } from "../../lib/format";

/** DS Salary, tam görünüm (aralık). */
export function Salary({ range: [min, max] }: { range: readonly [number, number] }) {
  return (
    <div className="en-salary en-salary--full">
      <p className="en-salary__label">
        Maaş aralığı <span>(net, aylık)</span>
      </p>
      <p className="en-salary__value en-num">
        {formatTL(min)} <span aria-hidden="true">–</span>
        <span className="en-sr">ile</span> {formatTL(max)}
      </p>
    </div>
  );
}
