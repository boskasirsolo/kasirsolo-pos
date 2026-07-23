const trustItems = [
  { icon: '\u{1F6E1}', text: 'Data <strong>100% Milik Anda</strong>' },
  { icon: '\u{1F512}', text: 'Enkripsi <strong>End-to-End</strong>' },
  { icon: '\u{2601}', text: 'Backup <strong>Cloud Otomatis</strong>' },
  { icon: '\u{1F4F1}', text: 'Akses <strong>Multi-Device</strong>' },
  { icon: '\u{1F4DE}', text: 'Support <strong>WA Langsung</strong>' },
];

export function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="trust-strip-inner">
        {trustItems.map((item, i) => (
          <div key={i} className="trust-item">
            <span className="trust-item-icon">{item.icon}</span>
            <span
              className="trust-item-text"
              dangerouslySetInnerHTML={{ __html: item.text }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
