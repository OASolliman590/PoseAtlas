import { useMemo } from "react";
import { assignSecondaryStructure, type SSAnalysis } from "./dssp";
import { collectChargeCenters, pocketResidueKeys } from "./electrostatics";
import { buildFingerprint } from "./fingerprint";
import { findInteractions, uniqueResidues, type Interaction } from "./interactions";
import { chainDisplay, ligandDisplay, proteinDisplay } from "./names";
import { ligandAtoms, proteinAtoms } from "./structure";
import { selectFocused, selectVisible, useSession, type FigureMode } from "./session-store";

export function useAnalysis() {
  const session = useSession();
  const focused = selectFocused(session);
  const visible = selectVisible(session);
  const receptor = useMemo(() => {
    if (!session.poses.length) return null;
    return (
      session.poses.find((p) => p.id.endsWith("-native")) ??
      session.poses[0] ??
      null
    );
  }, [session.poses]);

  const ss = useMemo<SSAnalysis | null>(() => {
    if (!receptor) return null;
    return assignSecondaryStructure(proteinAtoms(receptor.inventory));
  }, [receptor]);

  const focusedHits = useMemo<Interaction[]>(() => {
    if (!receptor || !focused) return [];
    return findInteractions(proteinAtoms(receptor.inventory), ligandAtoms(focused.inventory));
  }, [receptor, focused]);

  const hitsByPose = useMemo(() => {
    if (!receptor) return [];
    return visible.map((pose) => ({
      poseId: pose.id,
      hits: findInteractions(proteinAtoms(receptor.inventory), ligandAtoms(pose.inventory)),
    }));
  }, [receptor, visible]);

  const fingerprint = useMemo(() => buildFingerprint(hitsByPose), [hitsByPose]);

  const pocketKeys = useMemo(() => {
    if (!receptor || !focused) return new Set<string>();
    return pocketResidueKeys(proteinAtoms(receptor.inventory), ligandAtoms(focused.inventory), 7.5);
  }, [receptor, focused]);

  const charges = useMemo(
    () => (receptor ? collectChargeCenters(proteinAtoms(receptor.inventory)) : []),
    [receptor],
  );

  const names = session.names;
  const proteinName = proteinDisplay(names, session.proteinFallback);
  const focusedLabel = focused ? ligandDisplay(names, focused.id, focused.fallbackLabel) : "";

  const caption = useMemo(
    () =>
      buildCaption({
        proteinName,
        ligandName: focusedLabel,
        mode: session.figureMode,
        overlay: visible.length > 1,
        overlayNames: visible.map((p) => ligandDisplay(names, p.id, p.fallbackLabel)),
        nContacts: uniqueResidues(focusedHits).length,
        chainNote: receptor
          ? receptor.inventory.chains.map((c) => chainDisplay(names, c.id)).join(" · ")
          : "",
      }),
    [proteinName, focusedLabel, session.figureMode, visible, names, focusedHits, receptor],
  );

  return {
    session,
    receptor,
    focused,
    visible,
    ss,
    focusedHits,
    hitsByPose,
    fingerprint,
    pocketKeys,
    charges,
    proteinName,
    focusedLabel,
    caption,
  };
}

function buildCaption(args: {
  proteinName: string;
  ligandName: string;
  mode: FigureMode;
  overlay: boolean;
  overlayNames: string[];
  nContacts: number;
  chainNote: string;
}): string {
  const modeLine: Record<FigureMode, string> = {
    interaction: "Cartoon with interacting side chains and polar contacts.",
    pocket: "Cutaway solvent-accessible surface of the binding pocket.",
    electrostatic: "Pocket surface coloured by a Coulombic approximation from formal charges at pH 7.",
    hydrophobic: "Pocket surface coloured by Kyte–Doolittle hydropathy.",
  };
  if (args.overlay) {
    return `Figure. Overlay of ${args.overlayNames.join(", ")} in ${args.proteinName}. ${modeLine[args.mode]}`;
  }
  const site = args.nContacts
    ? `${args.nContacts} contacting residues.`
    : "Binding-site view.";
  return `Figure. ${args.ligandName} bound to ${args.proteinName}${args.chainNote ? ` (${args.chainNote})` : ""}. ${site} ${modeLine[args.mode]}`;
}
