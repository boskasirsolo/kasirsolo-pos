/**
 * Authentication module for KASIRSOLO apps.
 * Handles login, logout, session management via Supabase Auth.
 */

import type { User, Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@kasirsolo/db';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

let _client: ReturnType<typeof createBrowserClient> | null = null;

/** Singleton Supabase client instance. */
function getClient(): NonNullable<ReturnType<typeof createBrowserClient>> {
  if (!_client) {
    _client = createBrowserClient();
    if (!_client) {
      throw new Error(
        '[kasirsolo-auth] Supabase client not initialized. Check environment variables.',
      );
    }
  }
  return _client;
}

/**
 * Log in with email and password.
 */
export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser; session: Session }> {
  const supabase = getClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user || !data.session) throw new Error('Login gagal');

  return {
    user: mapUser(data.user),
    session: data.session,
  };
}

/**
 * Log out the current user.
 */
export async function logout(): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/**
 * Get the current session, if any.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = getClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get the current authenticated user.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = getClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return mapUser(data.user);
}

/**
 * Listen for auth state changes.
 */
export function onAuthStateChange(callback: (session: Session | null) => void): {
  unsubscribe: () => void;
} {
  const supabase = getClient();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return { unsubscribe: data.subscription.unsubscribe };
}

function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
  };
}
