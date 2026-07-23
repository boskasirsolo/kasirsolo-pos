"use client";

import { useState, useEffect } from "react";
import { useClientForm } from "../logic/useClientForm";
import type { ClientFormData } from "../data/schema";
import type { KspClient } from "@kasirsolo/db/types";

interface ClientFormProps {
  client?: KspClient | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClientForm({ client, isOpen, onClose, onSuccess }: ClientFormProps) {
  const isEdit = !!client;
  const { loading, errors, serverError, submitCreate, submitUpdate, clearErrors } =
    useClientForm(onSuccess);

  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    phone: "",
    email: "",
    source: "",
    notes: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        phone: client.phone,
        email: client.email ?? "",
        source: client.source ?? "",
        notes: client.notes ?? "",
        status: client.status,
      });
    } else {
      setFormData({ name: "", phone: "", email: "", source: "", notes: "" });
    }
    clearErrors();
  }, [client, isOpen, clearErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && client) {
      await submitUpdate(client.id, formData);
    } else {
      await submitCreate(formData);
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h3 className="font-heading text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Klien" : "Tambah Klien Baru"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {serverError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Nama Bisnis *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Toko Sumber Rejeki"
                className={`input ${errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="label">Telepon *</label>
                <input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="08123456789"
                  className={`input ${errors.phone ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="toko@email.com"
                  className={`input ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" className="label">Sumber</label>
                <select
                  id="source"
                  value={formData.source}
                  onChange={(e) => handleChange("source", e.target.value)}
                  className="input"
                >
                  <option value="">Pilih sumber</option>
                  <option value="website">Website</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Media Sosial</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {isEdit && (
                <div>
                  <label htmlFor="status" className="label">Status</label>
                  <select
                    id="status"
                    value={formData.status ?? "trial"}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="input"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Aktif</option>
                    <option value="expired">Expired</option>
                    <option value="locked">Locked</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="label">Catatan</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Catatan internal tentang klien..."
                rows={3}
                className="input resize-none"
              />
              {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Klien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
