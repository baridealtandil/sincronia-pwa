/**
 * Smart Task Detector:
 * Parses multi-line raw text blocks into individual task items automatically.
 */
export const detectTasksFromText = (rawText: string): string[] => {
  if (!rawText || !rawText.trim()) return [];

  // Split by line breaks or semicolons
  const lines = rawText.split(/[\r\n;]+/);

  const tasks: string[] = [];

  for (let line of lines) {
    let cleaned = line.trim();
    if (!cleaned) continue;

    // Strip out bullet points, numbers, checkboxes (e.g., "1.", "-", "*", "[ ]", "a)")
    cleaned = cleaned
      .replace(/^[\d\w]+\.\s*/, '')
      .replace(/^[-*•]\s*/, '')
      .replace(/^\[\s*\]\s*/, '')
      .trim();

    if (cleaned.length > 2) {
      tasks.push(cleaned);
    }
  }

  return tasks;
};

/**
 * Smart Name Matcher:
 * Detects if a task assigned to "Gabriel" or "Gabriel Marcasso, Carolina Fernandez" matches a logged-in user like "Gabriel Marcasso".
 */
export const isTaskAssignedToUser = (
  assignedTo?: string | string[] | null,
  userFullName?: string | null,
  userFirstName?: string | null
): boolean => {
  if (!assignedTo) return false;

  const fn = userFirstName ? String(userFirstName).trim().toLowerCase() : '';
  const full = userFullName ? String(userFullName).trim().toLowerCase() : '';
  if (!fn && !full) return false;

  const rawStr = Array.isArray(assignedTo) ? assignedTo.join(', ') : String(assignedTo);
  const assignees = rawStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  return assignees.some(a => {
    if (!a) return false;
    if ((full && a === full) || (fn && a === fn)) return true;
    if (fn && fn.length >= 2 && (a.includes(fn) || fn.includes(a))) return true;
    if (full && (full.includes(a) || a.includes(full))) return true;
    return false;
  });
};
