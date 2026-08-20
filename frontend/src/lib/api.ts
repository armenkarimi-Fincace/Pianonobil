import type { Catalog } from './types';
import { FALLBACK_CATALOG } from './catalog-fallback';

/**
 * Thin client for the FastAPI backend.
 *
 * Every call degrades gracefully: the environment is a self-contained
 * instrument and must keep working when the API is briefly unreachable, so
 * reads fall back to the bundled catalog and writes fail quietly into a
 * returned error rather than throwing into the render tree.
 */

const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

/**
 * Server components reach the backend by its service name inside the compose
 * network; the browser reaches it by its published URL. `API_BASE_URL` covers
 * the former and falls back to the latter when the two are the same host.
 */
const SERVER_BASE = process.env.API_BASE_URL?.replace(/\/$/, '') || PUBLIC_BASE;

export const API_BASE_URL = PUBLIC_BASE;

const OFFLINE = process.env.NEXT_PUBLIC_OFFLINE_CATALOG === '1';

function baseUrl(): string {
  return typeof window === 'undefined' ? SERVER_BASE : PUBLIC_BASE;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}/api/v1${path}`, {
    cache: 'no-store',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`);
  }
  return (await res.json()) as T;
}

/** The whole catalog in one call: coefficients, jurisdictions, families, scenarios, events, gates. */
export async function fetchCatalog(): Promise<Catalog> {
  if (OFFLINE) return FALLBACK_CATALOG;
  try {
    return await request<Catalog>('/catalog');
  } catch {
    return FALLBACK_CATALOG;
  }
}

export interface SessionPayload {
  token: string;
  state: Record<string, unknown>;
  updated_at: string;
}

/** Open (or resume) a server-side session so a walk survives a reload. */
export async function createSession(state: Record<string, unknown>): Promise<SessionPayload | null> {
  try {
    return await request<SessionPayload>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ state }),
    });
  } catch {
    return null;
  }
}

export async function loadSession(token: string): Promise<SessionPayload | null> {
  try {
    return await request<SessionPayload>(`/sessions/${token}`);
  } catch {
    return null;
  }
}

export async function saveSession(
  token: string,
  state: Record<string, unknown>,
): Promise<SessionPayload | null> {
  try {
    return await request<SessionPayload>(`/sessions/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ state }),
    });
  } catch {
    return null;
  }
}

/* ---- The Vestibule's forms ------------------------------------------- */

export interface RequirementsSubmission {
  session_token?: string | null;
  party: string | null;
  path: string | null;
  family: string | null;
  institution_type: string | null;
  jurisdiction: string | null;
  answers: Record<string, string>;
  documents_ready: number;
  documents_total: number;
  carried_from: string | null;
  model_snapshot?: Record<string, unknown> | null;
}

export interface SubmissionReceipt {
  reference: string;
  received_at: string;
  status: string;
  message: string;
}

/** Submit the Requirements Register. A named senior person reads it before responding. */
export async function submitRequirements(
  payload: RequirementsSubmission,
): Promise<SubmissionReceipt | null> {
  try {
    return await request<SubmissionReceipt>('/vestibule/requirements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return null;
  }
}

export interface EnquiryPayload {
  name: string;
  email: string;
  organisation?: string | null;
  message: string;
  session_token?: string | null;
}

/** The general enquiry form. */
export async function submitEnquiry(payload: EnquiryPayload): Promise<SubmissionReceipt> {
  return await request<SubmissionReceipt>('/enquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Record a determination taken in the Mandate Room against the immutable register. */
export async function recordDetermination(payload: {
  session_token?: string | null;
  decision_id: string;
  matter: string;
  outcome: string;
}): Promise<SubmissionReceipt | null> {
  try {
    return await request<SubmissionReceipt>('/mandate/determinations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return null;
  }
}
