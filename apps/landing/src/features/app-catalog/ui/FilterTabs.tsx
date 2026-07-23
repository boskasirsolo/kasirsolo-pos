import type { CategoryFilter } from '../logic/useAppCatalog';

interface FilterTabsProps {
  active: CategoryFilter;
  onChange: (filter: CategoryFilter) => void;
}

const filters: { value: CategoryFilter; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'bisnis', label: 'Bisnis' },
  { value: 'institusi', label: 'Institusi' },
  { value: 'kesehatan', label: 'Kesehatan' },
];

export function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="filter-tabs">
      {filters.map((f) => (
        <button
          key={f.value}
          className={`filter-tab ${active === f.value ? 'active' : ''}`}
          onClick={() => onChange(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
