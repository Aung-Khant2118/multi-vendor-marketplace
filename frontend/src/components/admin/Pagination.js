import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { pageList } from '../../lib/pagination';

export default function Pagination({
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalCount,
  itemLabel = 'items',
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="vpagination">
      <div className="vpagination-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>Rows per page:</span>
        <select
          className="arows-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span>
          Showing {from}-{to} of {totalCount.toLocaleString('en-US')} {itemLabel}
        </span>
      </div>
      <div className="vpagination-controls">
        <button
          className="vpage-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <FiChevronLeft size={14} />
        </button>
        {pageList(currentPage, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="vpage-ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`vpage-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="vpage-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
