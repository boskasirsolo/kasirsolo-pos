const problems = [
  'Pencatatan manual rawan salah & lambat',
  'Stok tidak terkontrol, sering kehabisan atau kelebihan',
  'Laporan keuangan berantakan & tidak real-time',
  'Biaya langganan software mahal setiap bulan',
  'Data tersebar di banyak tempat, sulit diakses',
];

const solutions = [
  'Kasir digital otomatis, cepat & akurat',
  'Manajemen stok real-time dengan notifikasi',
  'Laporan lengkap otomatis: harian, mingguan, bulanan',
  'Bayar sekali, pakai seumur hidup - tanpa langganan',
  'Satu dashboard untuk semua data bisnis Anda',
];

export function ProblemSolution() {
  return (
    <section className="problem-solution">
      <div className="container">
        <div className="problem-card">
          <div className="ps-icon">{'\u{1F6AB}'}</div>
          <h3 className="ps-title">Masalah yang Sering Terjadi</h3>
          <ul className="ps-list">
            {problems.map((item, i) => (
              <li key={i}>
                <span className="icon">{'\u274C'}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="solution-card">
          <div className="ps-icon">{'\u2728'}</div>
          <h3 className="ps-title">Solusi dari KASIRSOLO</h3>
          <ul className="ps-list">
            {solutions.map((item, i) => (
              <li key={i}>
                <span className="icon">{'\u2705'}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
