import { DetectedProblem, ProblemDifficulty } from '../types/problem';

export class LeetCodeDetector {
  private lastDetectedSlug: string | null = null;
  private onProblemDetectedCallback?: (problem: DetectedProblem) => void;

  constructor(onProblemDetected?: (problem: DetectedProblem) => void) {
    this.onProblemDetectedCallback = onProblemDetected;
  }

  /**
   * Extract the problem titleSlug from the current URL
   */
  public extractSlug(): string | null {
    const match = window.location.pathname.match(/\/problems\/([^/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract problem title from DOM or document.title
   */
  public extractTitle(slug: string): { title: string; problemId?: string } {
    // 1. Try finding title element from DOM
    // LeetCode dynamic layout selectors
    const titleSelectors = [
      'div[data-cy="question-title"]',
      'a[href*="/problems/"][class*="text-title"]',
      'div[class*="text-title-large"]',
      'span[class*="text-title-large"]',
      'h4[data-cypress="QuestionTitle"]'
    ];

    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent?.trim()) {
        const rawText = el.textContent.trim();
        const idMatch = rawText.match(/^(\d+)\.\s*(.+)/);
        if (idMatch) {
          return { problemId: idMatch[1], title: idMatch[2] };
        }
        return { title: rawText };
      }
    }

    // 2. Fallback: Parse document.title (e.g. "1. Two Sum - LeetCode" or "Two Sum - LeetCode")
    const docTitle = document.title;
    const cleanDocTitle = docTitle.replace(/\s*-\s*LeetCode.*$/i, '').trim();
    if (cleanDocTitle && cleanDocTitle.toLowerCase() !== 'problems') {
      const idMatch = cleanDocTitle.match(/^(\d+)\.\s*(.+)/);
      if (idMatch) {
        return { problemId: idMatch[1], title: idMatch[2] };
      }
      return { title: cleanDocTitle };
    }

    // 3. Fallback: Capitalize slug (e.g. "two-sum" -> "Two Sum")
    const formattedSlug = slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return { title: formattedSlug };
  }

  /**
   * Extract difficulty (Easy, Medium, Hard)
   */
  public extractDifficulty(): ProblemDifficulty {
    // 1. Search for dedicated difficulty classes
    const easyEl = document.querySelector('[class*="text-difficulty-easy"], [class*="text-sd-easy"], [class*="text-olive"]');
    if (easyEl && /easy/i.test(easyEl.textContent || '')) return 'Easy';

    const medEl = document.querySelector('[class*="text-difficulty-medium"], [class*="text-sd-medium"], [class*="text-yellow"], [class*="text-amber"]');
    if (medEl && /medium/i.test(medEl.textContent || '')) return 'Medium';

    const hardEl = document.querySelector('[class*="text-difficulty-hard"], [class*="text-sd-hard"], [class*="text-pink"], [class*="text-red"]');
    if (hardEl && /hard/i.test(hardEl.textContent || '')) return 'Hard';

    // 2. Fallback: Search all elements with text exactly matching Easy, Medium, Hard
    const candidates = Array.from(document.querySelectorAll('div, span, p'));
    for (const el of candidates) {
      const text = el.textContent?.trim() || '';
      if (text === 'Easy') return 'Easy';
      if (text === 'Medium') return 'Medium';
      if (text === 'Hard') return 'Hard';
    }

    // Default to Medium if not yet resolved
    return 'Medium';
  }

  /**
   * Run detection on current page
   */
  public detect(): DetectedProblem | null {
    const slug = this.extractSlug();
    if (!slug) {
      this.lastDetectedSlug = null;
      return null;
    }

    const { title, problemId } = this.extractTitle(slug);
    const difficulty = this.extractDifficulty();

    const problem: DetectedProblem = {
      problemId,
      titleSlug: slug,
      title: problemId ? `${problemId}. ${title}` : title,
      difficulty,
      url: window.location.origin + `/problems/${slug}/`,
      timestamp: Date.now()
    };

    if (this.lastDetectedSlug !== slug) {
      this.lastDetectedSlug = slug;
      if (this.onProblemDetectedCallback) {
        this.onProblemDetectedCallback(problem);
      }
    }

    return problem;
  }

  /**
   * Start observing URL changes and DOM updates
   */
  public startObserving(intervalMs: number = 2000): void {
    // Initial run
    this.detect();

    // DOM Observer for SPA re-renders
    const observer = new MutationObserver(() => {
      const currentSlug = this.extractSlug();
      if (currentSlug && currentSlug !== this.lastDetectedSlug) {
        this.detect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Periodic safety check
    setInterval(() => {
      this.detect();
    }, intervalMs);

    // Navigation events
    window.addEventListener('popstate', () => this.detect());
  }
}
