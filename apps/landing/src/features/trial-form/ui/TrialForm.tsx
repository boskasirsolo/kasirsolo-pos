'use client';

import { useTrialForm } from '../logic/useTrialForm';
import { TrialBenefits } from './TrialBenefits';

const WA_NUMBER = '628816566935';

const appOptions = [
  { value: '', label: 'Pilih aplikasi...' },
  { value: 'retail', label: 'Kasir Retail - Rp250.000' },
  { value: 'konveksi', label: 'Manajemen Konveksi - Rp350.000' },
  { value: 'bengkel', label: 'Bengkel + Sparepart - Rp400.000' },
  { value: 'masjid', label: 'Manajemen Masjid - Rp200.000' },
  { value: 'tpa', label: 'Manajemen TPA/TPQ - Rp200.000' },
  { value: 'klinik', label: 'Klinik THT - Rp500.000' },
  { value: 'apotek', label: 'Apotek - Rp450.000' },
  { value: 'dapur', label: 'Dapur SPPG - Rp300.000' },
];

export function TrialForm() {
  const {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    updateField,
    submit,
  } = useTrialForm();

  const waMessage = encodeURIComponent(
    `Halo KASIRSOLO, saya baru saja mendaftar trial untuk aplikasi ${formData.app}. Nama saya ${formData.nama}.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <section className="trial-section" id="trial">
      <div className="trial-inner">
        <div className="trial-info">
          <span className="section-badge">{'\uD83C\uDD93'} Trial Gratis</span>
          <h2>
            Mulai <span className="gradient-text">Trial Gratis</span> Sekarang
          </h2>
          <p>
            Daftarkan bisnis Anda dan coba semua fitur KASIRSOLO selama 7 hari
            penuh tanpa biaya. Tanpa kartu kredit, tanpa komitmen.
          </p>
          <TrialBenefits />
        </div>

        <div className="trial-form-card">
          {isSuccess ? (
            <div className="trial-success">
              <div className="trial-success-icon">{'\u2705'}</div>
              <h3>Pendaftaran Berhasil!</h3>
              <p>
                Trial Anda sudah aktif selama 7 hari. Silakan hubungi kami via
                WhatsApp untuk panduan penggunaan dan aktivasi akun Anda.
              </p>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa btn-lg"
              >
                Lanjut ke WhatsApp
              </a>
            </div>
          ) : (
            <>
              <h3 className="trial-form-title">Daftar Trial Gratis</h3>
              <p className="trial-form-subtitle">
                Isi form di bawah ini. Proses kurang dari 1 menit.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label">
                    Nama Lengkap / Bisnis <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.nama ? 'error' : ''}`}
                    placeholder="Contoh: Toko Maju Jaya"
                    value={formData.nama}
                    onChange={(e) => updateField('nama', e.target.value)}
                  />
                  {errors.nama && (
                    <div className="form-error">{errors.nama}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Alamat <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.alamat ? 'error' : ''}`}
                    placeholder="Contoh: Jl. Slamet Riyadi No. 123, Solo"
                    value={formData.alamat}
                    onChange={(e) => updateField('alamat', e.target.value)}
                  />
                  {errors.alamat && (
                    <div className="form-error">{errors.alamat}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Nomor WhatsApp <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-input ${errors.wa ? 'error' : ''}`}
                    placeholder="Contoh: 08123456789"
                    value={formData.wa}
                    onChange={(e) => updateField('wa', e.target.value)}
                  />
                  {errors.wa && (
                    <div className="form-error">{errors.wa}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Pilih Aplikasi <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.app ? 'error' : ''}`}
                    value={formData.app}
                    onChange={(e) => updateField('app', e.target.value)}
                  >
                    {appOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.app && (
                    <div className="form-error">{errors.app}</div>
                  )}
                </div>

                {errors.form && (
                  <div className="form-error" style={{ marginBottom: 16 }}>
                    {errors.form}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg form-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" /> Mendaftarkan...
                    </>
                  ) : (
                    'Mulai Trial Gratis 7 Hari'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
