"use client";

import { useState } from "react";
import { useClients } from "./logic/useClients";
import { useClientFilter } from "./logic/useClientFilter";
import ClientTable from "./ui/ClientTable";
import ClientForm from "./ui/ClientForm";
import ClientDetail from "./ui/ClientDetail";
import type { ClientWithRelations } from "./data/types";

export default function ClientsFeature() {
  const { filter, setSearch, setStatus, setPage } = useClientFilter();
  const {
    clients,
    totalPages,
    loading,
    selectedClient,
    setSelectedClient,
    refresh,
  } = useClients(filter);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientWithRelations | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleCreate = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = (client: ClientWithRelations) => {
    setEditingClient(client);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleSelect = (client: ClientWithRelations) => {
    setSelectedClient(client);
    setShowDetail(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingClient(null);
    refresh();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-gray-900">Daftar Klien</h2>
          <p className="text-sm text-gray-500">Kelola semua klien dan bisnis terdaftar</p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Klien
        </button>
      </div>

      {/* Table */}
      <ClientTable
        clients={clients}
        loading={loading}
        filter={filter}
        totalPages={totalPages}
        onSearch={setSearch}
        onStatusFilter={setStatus}
        onPageChange={setPage}
        onSelect={handleSelect}
        onEdit={handleEdit}
      />

      {/* Form Modal */}
      <ClientForm
        client={editingClient}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Detail Modal */}
      <ClientDetail
        client={selectedClient}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onEdit={() => {
          if (selectedClient) handleEdit(selectedClient);
        }}
      />
    </div>
  );
}
