import { SolvedProblem } from '../types/problem';

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  python: 'py',
  python3: 'py',
  javascript: 'js',
  typescript: 'ts',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rust: 'rs',
  kotlin: 'kt',
  swift: 'swift',
  ruby: 'rb',
  csharp: 'cs',
};

const LANGUAGE_COMMENTS: Record<string, string> = {
  python: '#',
  python3: '#',
  javascript: '//',
  typescript: '//',
  java: '//',
  cpp: '//',
  c: '//',
  go: '//',
  rust: '//',
  kotlin: '//',
  swift: '//',
  ruby: '#',
  csharp: '//',
};

export function getSolutionFilename(problem: SolvedProblem): string {
  const ext = LANGUAGE_EXTENSIONS[problem.language] || 'txt';
  return `solution.${ext}`;
}

export function getSolutionDirectory(problem: SolvedProblem, solutionDir: string): string {
  const topic = problem.topics[0]?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized';
  const paddedId = (problem.problemId || '0000').padStart(4, '0');
  const slug = problem.titleSlug;
  return `${solutionDir}/${topic}/${paddedId}-${slug}`;
}

export function generateSolutionContent(problem: SolvedProblem): string {
  const comment = LANGUAGE_COMMENTS[problem.language] || '//';
  const lines = [
    `${comment} ${problem.title}`,
    `${comment} Problem: ${problem.url}`,
    `${comment} Difficulty: ${problem.difficulty}`,
    `${comment} Language: ${problem.language}`,
    '',
    problem.solution,
  ];
  return lines.join('\n');
}

export function generateProblemReadme(problem: SolvedProblem): string {
  const confidenceStars = '★'.repeat(problem.confidence) + '☆'.repeat(5 - problem.confidence);

  const sections = [
    `# ${problem.title}`,
    '',
    `**Difficulty:** ${problem.difficulty}`,
    `**Language:** ${problem.language}`,
    `**URL:** [LeetCode](${problem.url})`,
    `**Confidence:** ${confidenceStars} (${problem.confidence}/5)`,
    '',
  ];

  if (problem.topics.length > 0) {
    sections.push(`**Topics:** ${problem.topics.join(', ')}`, '');
  }

  if (problem.patterns.length > 0) {
    sections.push(`**Patterns:** ${problem.patterns.join(', ')}`, '');
  }

  if (problem.runtime !== undefined || problem.memory !== undefined) {
    sections.push('## Performance', '');
    if (problem.runtime !== undefined) {
      sections.push(`- **Runtime:** ${problem.runtime} ms`);
    }
    if (problem.memory !== undefined) {
      sections.push(`- **Memory:** ${problem.memory} MB`);
    }
    sections.push('');
  }

  if (problem.notes) {
    sections.push('## Notes', '', problem.notes, '');
  }

  if (problem.mistakes) {
    sections.push('## Mistakes', '', problem.mistakes, '');
  }

  sections.push(`---`, `*Solved on ${new Date(problem.submittedAt).toLocaleDateString()}*`);

  return sections.join('\n');
}
