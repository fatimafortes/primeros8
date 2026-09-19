export type ZoneAggregate = {
  zone: string;
  shift: string;
  response_count: number;
  avg_protective_action_ms: number | null;
  avg_assembly_ms: number | null;
};

export type SchedulerProposal = {
  targetZone: string;
  targetShift: string;
  scenarioVariant: string;
  rationale: string;
};

// Rotated by how many proposals this site has already made, not
// random — the same zone/shift pair won't get the same variant twice
// in a row.
const SCENARIO_VARIANTS = [
  "Sismo 6.2 simulado",
  "Fuga de montacargas simulada",
  "Corte eléctrico simulado",
];

// The adaptive part is which zone/shift and which variant get
// targeted, computed from real stored protective-action time and
// assembly-point geodata — not the calendar math, which is a fixed
// weekly cadence, honestly kept simple rather than dressed up to look
// smarter than it is.
export function proposeNextDrill(
  aggregates: ZoneAggregate[],
  priorProposalCount: number,
): SchedulerProposal | null {
  const eligible = aggregates.filter(
    (row) =>
      row.response_count >= 5 &&
      row.avg_protective_action_ms != null &&
      row.avg_assembly_ms != null,
  );

  if (eligible.length === 0) return null;

  const worst = eligible.reduce((worstSoFar, row) => {
    const score = row.avg_protective_action_ms! + row.avg_assembly_ms!;
    const worstScore =
      worstSoFar.avg_protective_action_ms! + worstSoFar.avg_assembly_ms!;
    return score > worstScore ? row : worstSoFar;
  });

  const scenarioVariant =
    SCENARIO_VARIANTS[priorProposalCount % SCENARIO_VARIANTS.length];

  const protectiveSeconds = (worst.avg_protective_action_ms! / 1000).toFixed(1);
  const assemblySeconds = (worst.avg_assembly_ms! / 1000).toFixed(1);

  return {
    targetZone: worst.zone,
    targetShift: worst.shift,
    scenarioVariant,
    rationale: `${worst.zone} · ${worst.shift} tiene el tiempo combinado más alto: ${protectiveSeconds}s hasta protegerse + ${assemblySeconds}s hasta el punto de reunión, con ${worst.response_count} respuestas.`,
  };
}
