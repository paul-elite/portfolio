import type { Writing } from '@/lib/content-model';
import styles from '@/app/home.module.css';

const NEW_FOR_DAYS = 45;

// Writing grouped by year: the year shows once per group, the date sits right as DD/MM.
// Hovering a row fades the rest; the newest piece gets a hand-drawn "New" ring while it's recent.
export default function WritingList({ items }: { items: Writing[] }) {
  const dated = [...items].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  const groups: { year: string; items: Writing[] }[] = [];
  for (const w of dated) {
    const year = w.date ? String(new Date(w.date).getFullYear()) : '';
    const g = groups[groups.length - 1];
    if (g && g.year === year) g.items.push(w);
    else groups.push({ year, items: [w] });
  }
  const newest = dated[0];
  const isNew = !!newest?.date && Date.now() - new Date(newest.date).getTime() < NEW_FOR_DAYS * 864e5;

  return (
    <ul className={styles.writing}>
      {groups.map((g) => (
        <li key={g.year || 'undated'} className={styles.writingYear}>
          <span className={styles.writingYearLabel}>{g.year}</span>
          <ul>
            {g.items.map((w) => {
              const d = w.date ? new Date(w.date) : null;
              const inner = (
                <>
                  <span className={styles.writingTitle}>
                    {w.title}
                    {isNew && w === newest && <NewMark />}
                  </span>
                  {d && <time dateTime={w.date}>{String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}</time>}
                </>
              );
              return (
                <li key={w.id} className={styles.writingRow}>
                  {/* Writing pages are cleared for the redesign, so only outside links are linked. */}
                  {w.link ? <a href={w.link} target="_blank" rel="noreferrer">{inner}</a> : <div>{inner}</div>}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function NewMark() {
  return (
    <span className={styles.newMark}>
      New
      <svg viewBox="0 0 48 26" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M30 2.2C38.6 1.6 46.4 5.1 46 12.6c-.4 7.3-10.6 11.4-22.6 11.2C11.6 23.6 2.2 19.7 2 13.4 1.8 6.9 10.4 2.6 21.6 2.4c6.4-.1 11.6.6 15.2 2" />
      </svg>
    </span>
  );
}
