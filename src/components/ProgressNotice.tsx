import { useSyncExternalStore } from 'react';
import { getProgressStore } from '../engine/progressStore';

export default function ProgressNotice() {
  const notice = useSyncExternalStore(
    (onChange) => getProgressStore().subscribe(onChange),
    () => getProgressStore().notice,
    () => null,
  );
  if (!notice) return null;
  return (
    <div className="notice" role="status">
      <p>{notice}</p>
      <button type="button" onClick={() => getProgressStore().dismissNotice()}>
        Dismiss
      </button>
    </div>
  );
}
