import type { AppItem } from '../data/types';

interface AppCardProps {
  app: AppItem;
  onClick: (app: AppItem) => void;
}

export function AppCard({ app, onClick }: AppCardProps) {
  return (
    <div className="app-card" onClick={() => onClick(app)}>
      <div className="app-card-header">
        <div className="app-card-icon">{app.icon}</div>
        {app.hot && <span className="app-card-badge">Hot</span>}
      </div>
      <h3 className="app-card-title">{app.name}</h3>
      <p className="app-card-desc">{app.description.slice(0, 80)}...</p>
      <div className="app-card-footer">
        <div className="app-card-price">
          <span className="currency">Rp</span>
          {app.price.toLocaleString('id-ID')}
          <span className="period"> /selamanya</span>
        </div>
        <span className="app-card-action">Detail</span>
      </div>
    </div>
  );
}
