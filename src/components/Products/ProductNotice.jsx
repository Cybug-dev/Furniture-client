import { useEffect } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

export default function ProductNotice({ notice, onClose }) {
  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeout);
  }, [notice, onClose]);

  if (!notice) return null;
  const Icon = notice.type === 'success' ? CheckCircle2 : Info;

  return (
    <div className={`products-notice products-notice--${notice.type || 'info'}`} role="status" aria-live="polite">
      <Icon size={20} aria-hidden="true" />
      <span>{notice.message}</span>
      <button type="button" onClick={onClose} aria-label="Close message"><X size={17} /></button>
    </div>
  );
}
