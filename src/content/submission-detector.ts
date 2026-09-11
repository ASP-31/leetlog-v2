import { SubmissionResult } from '../types/submission';

const ACCEPTED_SELECTORS = [
  '[data-e2e-ctype="ac"]',
  '[class*="text-green-s"]',
  '[class*="accepted"]',
  '.success__3DsQ',
];

const RESULT_PANEL_SELECTORS = [
  '[data-e2e="submission-result"]',
  '[class*="result"]',
  '.ant-row',
];

const LANGUAGE_SELECTORS = [
  '[data-e2e="lang-select"]',
  '[class*="lang-select"]',
  'select[data-e2e-ctype="lang"]',
];

const RUNTIME_SELECTORS = [
  '[data-e2e="runtime"]',
  '[class*="runtime"]',
];

const MEMORY_SELECTORS = [
  '[data-e2e="memory"]',
  '[class*="memory"]',
];

export class SubmissionDetector {
  private lastSubmissionTime = 0;
  private onSubmissionCallback?: (result: SubmissionResult) => void;
  private observer: MutationObserver | null = null;

  constructor(onSubmission?: (result: SubmissionResult) => void) {
    this.onSubmissionCallback = onSubmission;
  }

  public startObserving(): void {
    this.observer = new MutationObserver(() => {
      this.checkForSubmissionResult();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    setInterval(() => this.checkForSubmissionResult(), 3000);
  }

  public stopObserving(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private checkForSubmissionResult(): void {
    const result = this.extractSubmissionResult();
    if (!result) return;

    const now = Date.now();
    if (now - this.lastSubmissionTime < 10000) return;
    this.lastSubmissionTime = now;

    console.log('[LeetLog] Submission detected:', result);
    this.onSubmissionCallback?.(result);
  }

  private extractSubmissionResult(): SubmissionResult | null {
    const accepted = this.isAccepted();
    if (accepted === null) return null;

    const language = this.extractLanguage();
    const runtime = this.extractMetric(RUNTIME_SELECTORS);
    const memory = this.extractMetric(MEMORY_SELECTORS);
    const statusText = accepted ? 'Accepted' : 'Not Accepted';

    return {
      accepted,
      language,
      runtime,
      memory,
      statusText,
    };
  }

  private isAccepted(): boolean | null {
    for (const selector of ACCEPTED_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) {
        const text = el.textContent?.toLowerCase() || '';
        if (text.includes('accepted') || text.includes('success')) return true;
        if (text.includes('wrong') || text.includes('error') || text.includes('tle') || text.includes('runtime error')) return false;
      }
    }

    for (const selector of RESULT_PANEL_SELECTORS) {
      const panel = document.querySelector(selector);
      if (panel) {
        const text = panel.textContent?.toLowerCase() || '';
        if (text.includes('accepted')) return true;
        if (text.includes('wrong answer') || text.includes('compile error') || text.includes('runtime error') || text.includes('time limit')) return false;
      }
    }

    const allText = document.body.textContent?.toLowerCase() || '';
    if (allText.includes('accepted') && (allText.includes('runtime') || allText.includes('击败'))) {
      return true;
    }

    return null;
  }

  private extractLanguage(): string {
    for (const selector of LANGUAGE_SELECTORS) {
      const el = document.querySelector(selector) as HTMLSelectElement;
      if (el) {
        if (el.tagName === 'SELECT') {
          const selected = el.options[el.selectedIndex];
          return selected?.textContent?.trim() || '';
        }
        return el.textContent?.trim() || '';
      }
    }

    const langPatterns = [
      { regex: /python/i, lang: 'python' },
      { regex: /python3/i, lang: 'python3' },
      { regex: /javascript/i, lang: 'javascript' },
      { regex: /typescript/i, lang: 'typescript' },
      { regex: /java(?!script)/i, lang: 'java' },
      { regex: /c\+\+/i, lang: 'cpp' },
      { regex: /\bc\b(?!\+\+)/i, lang: 'c' },
      { regex: /golang/i, lang: 'go' },
      { regex: /rust/i, lang: 'rust' },
      { regex: /kotlin/i, lang: 'kotlin' },
      { regex: /swift/i, lang: 'swift' },
      { regex: /ruby/i, lang: 'ruby' },
    ];

    const codeArea = document.querySelector('.view-lines, .monaco-editor, [class*="code-editor"]');
    if (codeArea) {
      const classes = codeArea.className;
      for (const { regex, lang } of langPatterns) {
        if (regex.test(classes)) return lang;
      }
    }

    return 'unknown';
  }

  private extractMetric(selectors: string[]): number | undefined {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const text = el.textContent || '';
        const numMatch = text.match(/([\d,]+\.?\d*)\s*(ms|s|mb|gb)?/i);
        if (numMatch) {
          const value = parseFloat(numMatch[1].replace(',', ''));
          const unit = numMatch[2]?.toLowerCase();
          if (unit === 's') return value * 1000;
          if (unit === 'gb') return value * 1024;
          return value;
        }
      }
    }
    return undefined;
  }
}
