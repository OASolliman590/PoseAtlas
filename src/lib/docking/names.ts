export type Nomenclature = {
  protein: string;
  chains: Record<string, string>;
  ligands: Record<string, string>;
  hetatms: Record<string, string>;
};

export function emptyNames(): Nomenclature {
  return { protein: "", chains: {}, ligands: {}, hetatms: {} };
}

export function chainDisplay(names: Nomenclature, chainId: string): string {
  const custom = names.chains[chainId]?.trim();
  if (custom) return custom;
  return `Chain ${chainId}`;
}

export function ligandDisplay(names: Nomenclature, poseId: string, fallback: string): string {
  const custom = names.ligands[poseId]?.trim();
  return custom || fallback;
}

export function hetDisplay(names: Nomenclature, key: string, fallback: string): string {
  const custom = names.hetatms[key]?.trim();
  return custom || fallback;
}

export function proteinDisplay(names: Nomenclature, fallback: string): string {
  return names.protein.trim() || fallback;
}

export function residueWithDomain(
  names: Nomenclature,
  chain: string,
  label: string,
): { label: string; domain: string } {
  return { label, domain: chainDisplay(names, chain) };
}

const STORAGE_KEY = "poseatlas-nomenclature";

export function persistNames(sessionKey: string, names: Nomenclature): void {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, Nomenclature>;
    all[sessionKey] = names;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* quota / private mode */
  }
}

export function restoreNames(sessionKey: string): Nomenclature | null {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, Nomenclature>;
    return all[sessionKey] ?? null;
  } catch {
    return null;
  }
}
