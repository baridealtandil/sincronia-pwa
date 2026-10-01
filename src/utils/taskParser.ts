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
 * Detects if a task assigned to "Gabriel" or "Gabriel Marcasso" matches a logged-in user like "Gabriel Marcasso".
 */
export const isTaskAssignedToUser = (
  assignedTo?: string | null,
  userFullName?: string | null,
  userFirstName?: string | null
): boolean => {
  if (!assignedTo) return false;

  const a = String(assignedTo).trim().toLowerCase();
  const fn = userFirstName ? String(userFirstName).trim().toLowerCase() : '';
  const full = userFullName ? String(userFullName).trim().toLowerCase() : '';

  if (!a || (!fn && !full)) return false;

  // Direct exact match
  if ((full && a === full) || (fn && a === fn)) return true;

  // Check if assignedTo contains first name or vice versa
  if (fn && fn.length >= 2 && (a.includes(fn) || fn.includes(a))) return true;

  // Check if assignedTo is inside full name or vice versa
  if (full && (full.includes(a) || a.includes(full))) return true;

  return false;
};
