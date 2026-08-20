import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function SectionPanel({ title, subtitle, linkHref, linkLabel, children }) {
  return (
    <div className="section-panel">
      <div className="section-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {linkHref && (
          <Link href={linkHref} className="section-link">
            {linkLabel} <FiArrowRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
