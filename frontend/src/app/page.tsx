import { PianoNobile } from '@/components/PianoNobile';
import { fetchCatalog } from '@/lib/api';

/**
 * The environment is rendered on the server with the catalog already resolved,
 * so the first paint carries the real coefficients rather than a placeholder.
 */
export const dynamic = 'force-dynamic';

export default async function Page() {
  const catalog = await fetchCatalog();
  return <PianoNobile catalog={catalog} />;
}
