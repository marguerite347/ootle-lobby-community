import {useEffect, useState} from 'react';

function readProgress(key: string, count: number): boolean[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) || 'null');
    if (Array.isArray(stored)) return Array.from({length:count}, (_, index) => stored[index] === true);
  } catch { /* A checklist also works without browser storage. */ }
  return Array(count).fill(false);
}

export default function ContestChecklist({id, items}: {id: string; items: string[]}) {
  const key = `ootle-october-2026-checklist-${id}`;
  const [checked, setChecked] = useState(() => readProgress(key, items.length));
  const [saved, setSaved] = useState(true);
  useEffect(() => {setChecked(readProgress(key, items.length));}, [key, items.length]);
  function toggle(index: number) {
    const next = checked.map((value, itemIndex) => itemIndex === index ? !value : value);
    setChecked(next);
    try {localStorage.setItem(key, JSON.stringify(next)); setSaved(true);} catch {setSaved(false);}
  }
  const complete = checked.filter(Boolean).length;
  return <div className="contest-checklist">
    <div className="checklist-progress"><span>Your checklist</span><strong aria-live="polite">{complete} / {items.length}</strong></div>
    <progress value={complete} max={items.length} aria-label="Preparation checklist progress"/>
    {items.map((item,index) => <label key={item} className={checked[index] ? 'is-checked' : ''}><input type="checkbox" checked={checked[index] || false} onChange={() => toggle(index)}/><span>{item}</span></label>)}
    <p className="checklist-storage" role="status">{saved ? 'Progress saved in this browser. Checking a step does not submit an entry.' : 'Progress stays on this page only; browser storage is unavailable.'}</p>
  </div>;
}
