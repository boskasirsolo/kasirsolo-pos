'use client';

import { PhoneMockup } from './PhoneMockup';
import { FloatingChips } from './FloatingChips';
import { useCounterAnimation } from '../logic/useCounterAnimation';

function StatCounter({
  end,
  suffix,
  label,
}: {
  end: number;
  suffix: string;
  label: string;
}) {
  const { ref, display } = useCounterAnimation({ end, suffix });
  return (
    <div className="hero-stat" ref={ref}>
      <span className="hero-stat-number gradient-text">{display}</span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-gradient" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Bayar Sekali, Pakai Seumur Hidup
          </div>

          <h1 className="hero-title">
            Kelola Bisnis Lebih <span className="gradient-text">Mudah</span> &{' '}
            <span className="gradient-text">Efisien</span>
          </h1>

          <p className="hero-lead">
            Aplikasi kasir & manajemen bisnis terlengkap untuk retail, bengkel,
            apotek, klinik, dan lainnya. Tanpa biaya langganan bulanan &mdash;
            bayar sekali, pakai seumur hidup.
          </p>

          <div className="hero-actions">
            <a href="#trial" className="btn btn-primary btn-lg">
              Coba Gratis 7 Hari
            </a>
            <a href="#aplikasi" className="btn btn-secondary btn-lg">
              Lihat Aplikasi
            </a>
          </div>

          <div className="hero-stats">
            <StatCounter end={500} suffix="+" label="Klien Aktif" />
            <StatCounter end={8} suffix="" label="Aplikasi" />
            <StatCounter end={99} suffix="%" label="Uptime" />
          </div>
        </div>

        <div className="hero-visual">
          <PhoneMockup />
          <FloatingChips />
        </div>
      </div>
    </section>
  );
}
