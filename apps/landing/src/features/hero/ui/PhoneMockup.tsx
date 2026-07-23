export function PhoneMockup() {
  return (
    <div className="phone-mockup">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="phone-status-bar">
          <span>09:41</span>
          <span>&#9679;&#9679;&#9679;</span>
        </div>

        <div className="phone-app-header">
          <div className="phone-store-name">
            <div className="phone-store-avatar">K</div>
            <div>
              <h3>Halo, Toko Maju!</h3>
              <small>Selamat datang kembali</small>
            </div>
          </div>
        </div>

        <div className="phone-quick-actions">
          <div className="phone-quick-action">
            <span className="phone-quick-action-icon">&#128179;</span>
            <span>Kasir</span>
          </div>
          <div className="phone-quick-action">
            <span className="phone-quick-action-icon">&#128230;</span>
            <span>Stok</span>
          </div>
          <div className="phone-quick-action">
            <span className="phone-quick-action-icon">&#128200;</span>
            <span>Laporan</span>
          </div>
          <div className="phone-quick-action">
            <span className="phone-quick-action-icon">&#128101;</span>
            <span>Member</span>
          </div>
        </div>

        <div className="phone-transactions">
          <div className="phone-transactions-title">Transaksi Terkini</div>
          <div className="phone-transaction-item">
            <div className="phone-transaction-info">
              <div className="phone-transaction-icon">&#128722;</div>
              <div className="phone-transaction-text">
                <h4>TRX-001</h4>
                <p>3 item</p>
              </div>
            </div>
            <div className="phone-transaction-amount">+Rp85.000</div>
          </div>
          <div className="phone-transaction-item">
            <div className="phone-transaction-info">
              <div className="phone-transaction-icon">&#128722;</div>
              <div className="phone-transaction-text">
                <h4>TRX-002</h4>
                <p>5 item</p>
              </div>
            </div>
            <div className="phone-transaction-amount">+Rp142.500</div>
          </div>
          <div className="phone-transaction-item">
            <div className="phone-transaction-info">
              <div className="phone-transaction-icon">&#128722;</div>
              <div className="phone-transaction-text">
                <h4>TRX-003</h4>
                <p>2 item</p>
              </div>
            </div>
            <div className="phone-transaction-amount">+Rp67.000</div>
          </div>
        </div>

        <div className="phone-bottom-bar">
          <div className="phone-bottom-icon active">
            <span>&#127968;</span>
            <span>Home</span>
          </div>
          <div className="phone-bottom-icon">
            <span>&#128179;</span>
            <span>Kasir</span>
          </div>
          <div className="phone-bottom-icon">
            <span>&#128200;</span>
            <span>Laporan</span>
          </div>
          <div className="phone-bottom-icon">
            <span>&#9881;</span>
            <span>Setting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
