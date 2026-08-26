import { FiX } from 'react-icons/fi';

export default function Modal({ title, onClose, children }) {
  return (
    <div className="amodal-backdrop" onClick={onClose}>
      <div className="amodal" onClick={(e) => e.stopPropagation()}>
        <div className="amodal-head">
          <h3>{title}</h3>
          <button type="button" className="amodal-close" onClick={onClose} aria-label="Close">
            <FiX size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
