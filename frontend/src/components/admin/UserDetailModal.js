import { useState } from 'react';
import { FiX, FiCheckCircle, FiTrash2 } from 'react-icons/fi';

const initialsOf = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Dark-navy variant of the modal shell (see admin design Frame 12): distinct
// from the light Modal.js used elsewhere, matching the reference exactly.
export default function UserDetailModal({ user, onClose, onChangeRole, onMarkVerified, onDelete }) {
  const [role, setRole] = useState(user.role);

  const handleRoleChange = (e) => {
    const next = e.target.value;
    setRole(next);
    onChangeRole?.(user.id, next);
  };

  const handleDelete = () => {
    onDelete?.(user.id);
    onClose();
  };

  return (
    <div className="amodal-backdrop" onClick={onClose}>
      <div className="auser-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auser-modal-close" onClick={onClose} aria-label="Close">
          <FiX size={16} />
        </button>

        <div className="auser-modal-avatar-wrap">
          <span className="auser-modal-avatar">{initialsOf(user.name)}</span>
          {user.online && <span className="auser-modal-status-dot" />}
        </div>

        <div className="auser-modal-name">
          {user.name}
          {user.verified && <FiCheckCircle size={16} className="auser-modal-verified-icon" />}
        </div>
        <div className="auser-modal-uid">#{user.uid}</div>

        <div className="auser-modal-panel">
          <div className="auser-modal-grid">
            <div>
              <div className="auser-modal-field-label">Name</div>
              <div className="auser-modal-field-value">{user.name}</div>
            </div>
            <div>
              <div className="auser-modal-field-label">Email</div>
              <div className="auser-modal-field-value">{user.email}</div>
            </div>
            <div>
              <div className="auser-modal-field-label">Phone</div>
              <div className="auser-modal-field-value">{user.phone}</div>
            </div>
            <div>
              <div className="auser-modal-field-label">Joined Date</div>
              <div className="auser-modal-field-value">{user.joined}</div>
            </div>
          </div>

          <div className="auser-modal-divider" />

          <div className="auser-modal-grid">
            <div>
              <div className="auser-modal-field-label">Role</div>
              <select className="auser-modal-select" value={role} onChange={handleRoleChange}>
                <option value="CUSTOMER">Customer</option>
                <option value="VENDOR">Vendor</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div className="auser-modal-hint">Change Role</div>
            </div>
            <div>
              <div className="auser-modal-field-label">Verification</div>
              {user.verified ? (
                <span className="vpill vpill-green">
                  <FiCheckCircle size={11} /> Verified
                </span>
              ) : (
                <>
                  <span className="vpill vpill-gray" style={{ marginBottom: 8 }}>
                    Unverified
                  </span>
                  <button type="button" className="auser-modal-verify-btn" onClick={() => onMarkVerified?.(user.id)}>
                    <FiCheckCircle size={13} /> Mark as Verified
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="auser-modal-footer">
          <button type="button" className="auser-modal-delete" onClick={handleDelete}>
            <FiTrash2 size={14} /> Delete User
          </button>
          <button type="button" className="auser-modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
