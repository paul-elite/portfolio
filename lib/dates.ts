// An article's date as it reads under the title: "November 1st, 2026".
const ordinal = (n: number) => {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  return `${n}${teen ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
};

export function longDate(iso?: string) {
  if (!iso) return undefined;
  // A bare year (or anything that isn't a full date) is shown as it is
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const month = d.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' });
  return `${month} ${ordinal(d.getUTCDate())}, ${d.getUTCFullYear()}`;
}
