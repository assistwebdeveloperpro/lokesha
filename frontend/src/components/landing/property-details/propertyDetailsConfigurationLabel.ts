const CONFIG_LABEL_RE = /^(\d+\+?)\s*BHK(?:\s+(.+))?$/i;

function sortBhkKeys(a: string, b: string) {
  const delta = parseInt(a, 10) - parseInt(b, 10);
  return Number.isFinite(delta) && delta !== 0 ? delta : a.localeCompare(b);
}

export function formatPropertyConfigurationLabel(labels: string[]): string {
  const groups = new Map<string, string[]>();
  const unmatched: string[] = [];

  for (const raw of labels) {
    const label = raw.trim();
    if (!label) continue;

    const match = CONFIG_LABEL_RE.exec(label);
    if (!match) {
      unmatched.push(label);
      continue;
    }

    const bhk = match[1];
    const unitType = match[2]?.trim() ?? "";
    const bhks = groups.get(unitType);
    if (bhks) {
      if (!bhks.includes(bhk)) bhks.push(bhk);
    } else {
      groups.set(unitType, [bhk]);
    }
  }

  const grouped = [...groups.entries()].map(([unitType, bhks]) => {
    const prefix = `${[...bhks].sort(sortBhkKeys).join(", ")} BHK`;
    return unitType ? `${prefix} ${unitType}` : prefix;
  });

  return [...grouped, ...unmatched].join(", ");
}
