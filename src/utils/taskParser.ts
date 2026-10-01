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
