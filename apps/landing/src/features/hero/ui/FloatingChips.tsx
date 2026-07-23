export function FloatingChips() {
  const chips = [
    { icon: '&#128179;', label: 'Multi-Kasir' },
    { icon: '&#128200;', label: 'Laporan Real-time' },
    { icon: '&#128230;', label: 'Stok Otomatis' },
    { icon: '&#128241;', label: 'Multi-Device' },
    { icon: '&#9989;', label: 'Sekali Bayar' },
  ];

  return (
    <div className="floating-chips">
      {chips.map((chip, i) => (
        <div key={i} className="floating-chip">
          <span
            className="floating-chip-icon"
            dangerouslySetInnerHTML={{ __html: chip.icon }}
          />
          <span>{chip.label}</span>
        </div>
      ))}
    </div>
  );
}
