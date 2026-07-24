'use client';

// Re-export for convenience. The queries layer depends on Supabase
// and can be extended for FnB-specific auth needs.

export { login, logout, getSession, getCurrentUser, onAuthStateChange } from '@kasirsolo/auth';
export type { AuthUser } from '@kasirsolo/auth';
