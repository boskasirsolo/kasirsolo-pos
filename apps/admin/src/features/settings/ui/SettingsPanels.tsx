"use client";

import type { BusinessSettings, BankSettings, TrialConfig, SecuritySettings, WATemplate } from "../data/types";

/* ============ Business Panel ============ */
export function BusinessPanel({
  data,
  onChange,
}: {
  data: BusinessSettings | null;
  onChange: (data: BusinessSettings) => void;
}) {
  if (!data) return null;

  const update = (field: keyof BusinessSettings, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Nama Bisnis</label>
        <input type="text" value={data.business_name} onChange={(e) => update("business_name", e.target.value)} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Nama Pemilik</label>
          <input type="text" value={data.owner_name} onChange={(e) => update("owner_name", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Telepon</label>
          <input type="text" value={data.phone} onChange={(e) => update("phone", e.target.value)} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} className="input" />
      </div>
      <div>
        <label className="label">Alamat</label>
        <textarea value={data.address} onChange={(e) => update("address", e.target.value)} rows={3} className="input resize-none" />
      </div>
    </div>
  );
}

/* ============ Bank Panel ============ */
export function BankPanel({
  data,
  onChange,
}: {
  data: BankSettings | null;
  onChange: (data: BankSettings) => void;
}) {
  if (!data) return null;

  const update = (field: keyof BankSettings, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Nama Bank</label>
          <input type="text" value={data.bank_name} onChange={(e) => update("bank_name", e.target.value)} placeholder="BCA, BRI, Mandiri..." className="input" />
        </div>
        <div>
          <label className="label">Kode Bank</label>
          <input type="text" value={data.bank_code} onChange={(e) => update("bank_code", e.target.value)} placeholder="014" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Nomor Rekening</label>
        <input type="text" value={data.account_number} onChange={(e) => update("account_number", e.target.value)} className="input" />
      </div>
      <div>
        <label className="label">Nama Pemilik Rekening</label>
        <input type="text" value={data.account_holder} onChange={(e) => update("account_holder", e.target.value)} className="input" />
      </div>
    </div>
  );
}

/* ============ Trial Config Panel ============ */
export function TrialPanel({
  data,
  onChange,
}: {
  data: TrialConfig | null;
  onChange: (data: TrialConfig) => void;
}) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Durasi Trial (hari)</label>
          <input
            type="number"
            value={data.trial_duration_days}
            onChange={(e) => onChange({ ...data, trial_duration_days: Number(e.target.value) })}
            min={1}
            max={30}
            className="input"
          />
        </div>
        <div>
          <label className="label">Max Extend</label>
          <input
            type="number"
            value={data.max_extend_count}
            onChange={(e) => onChange({ ...data, max_extend_count: Number(e.target.value) })}
            min={0}
            max={5}
            className="input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Durasi Extend (hari)</label>
          <input
            type="number"
            value={data.extend_duration_days}
            onChange={(e) => onChange({ ...data, extend_duration_days: Number(e.target.value) })}
            min={1}
            max={30}
            className="input"
          />
        </div>
        <div>
          <label className="label">Auto Lock Setelah (hari)</label>
          <input
            type="number"
            value={data.auto_lock_after_days}
            onChange={(e) => onChange({ ...data, auto_lock_after_days: Number(e.target.value) })}
            min={1}
            max={14}
            className="input"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.auto_lock_enabled}
          onChange={(e) => onChange({ ...data, auto_lock_enabled: e.target.checked })}
          className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
        />
        <span className="text-gray-700">Aktifkan auto-lock setelah trial berakhir</span>
      </label>
    </div>
  );
}

/* ============ Security Panel ============ */
export function SecurityPanel({
  data,
  onChange,
}: {
  data: SecuritySettings | null;
  onChange: (data: SecuritySettings) => void;
}) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.require_2fa}
          onChange={(e) => onChange({ ...data, require_2fa: e.target.checked })}
          className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
        />
        <span className="text-gray-700">Wajibkan 2FA untuk semua admin</span>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Session Timeout (menit)</label>
          <input
            type="number"
            value={data.session_timeout_minutes}
            onChange={(e) => onChange({ ...data, session_timeout_minutes: Number(e.target.value) })}
            min={5}
            max={1440}
            className="input"
          />
        </div>
        <div>
          <label className="label">Max Login Attempts</label>
          <input
            type="number"
            value={data.max_login_attempts}
            onChange={(e) => onChange({ ...data, max_login_attempts: Number(e.target.value) })}
            min={3}
            max={10}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="label">Allowed IPs (satu per baris, kosong = semua)</label>
        <textarea
          value={data.allowed_ips.join("\n")}
          onChange={(e) => onChange({ ...data, allowed_ips: e.target.value.split("\n").filter(Boolean) })}
          rows={4}
          placeholder="192.168.1.1&#10;10.0.0.0/24"
          className="input resize-none font-mono text-sm"
        />
      </div>
    </div>
  );
}

/* ============ WhatsApp Templates Panel ============ */
export function WATemplatesPanel({
  templates,
  onChange,
}: {
  templates: WATemplate[];
  onChange: (templates: WATemplate[]) => void;
}) {
  const updateTemplate = (id: string, field: keyof WATemplate, value: string) => {
    onChange(
      templates.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">
        Gunakan variabel: {"{{name}}"}, {"{{app_code}}"}, {"{{license_key}}"}, {"{{trial_expires}}"}, {"{{days_left}}"}, {"{{amount}}"}, {"{{bank_info}}"}
      </p>
      {templates.map((tmpl) => (
        <div key={tmpl.id} className="rounded-lg border border-surface-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{tmpl.name}</h4>
              <p className="text-xs text-gray-400">{tmpl.description}</p>
            </div>
            <code className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{tmpl.id}</code>
          </div>
          <textarea
            value={tmpl.template}
            onChange={(e) => updateTemplate(tmpl.id, "template", e.target.value)}
            rows={4}
            className="input resize-none text-sm"
          />
        </div>
      ))}
    </div>
  );
}
