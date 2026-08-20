import type { Catalog, DocumentTemplate } from './types';

/**
 * The document pack is generated from who is engaging and from the
 * jurisdiction — never from a fixed form. The prose for each item is served by
 * the backend as part of the catalog; this function only decides which sets
 * apply and in what order, exactly as the original `docPack()` did.
 */
export function docPack(
  catalog: Catalog,
  party: string | null,
  jurKey: string | null,
): DocumentTemplate[] {
  if (!party) return [];
  const templates = catalog.documentTemplates || {};
  const core = templates['party_' + party] || [];
  // The original falls back to ADGM's tier when no jurisdiction is declared.
  const jur = catalog.jurisdictions[jurKey || 'adgm'] || catalog.jurisdictions.adgm;
  const byTier = templates['jur_' + (jur ? jur.tier : 'none')] || [];
  return [...core, ...byTier];
}
