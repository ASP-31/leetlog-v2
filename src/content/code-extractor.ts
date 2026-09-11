import { CodeExtracted } from '../types/submission';

declare global {
  interface Window {
    monaco?: {
      editor?: {
        getModels: () => Array<{ getValue: () => string }>;
      };
    };
  }
}

export class CodeExtractor {
  private languageMap: Record<string, string> = {
    'python': 'python',
    'python3': 'python3',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'java': 'java',
    'c++': 'cpp',
    'c': 'c',
    'golang': 'go',
    'go': 'go',
    'rust': 'rust',
    'kotlin': 'kotlin',
    'swift': 'swift',
    'ruby': 'ruby',
    'c#': 'csharp',
  };

  extract(detectedLanguage?: string): CodeExtracted | null {
    const code = this.extractFromMonaco();
    if (!code) return null;

    const language = this.resolveLanguage(code, detectedLanguage);
    return { code, language };
  }

  private extractFromMonaco(): string | null {
    try {
      if (window.monaco?.editor?.getModels) {
        const models = window.monaco.editor.getModels();
        if (models.length > 0) {
          const code = models[0].getValue();
          if (code && code.trim().length > 0) {
            return code;
          }
        }
      }
    } catch (e) {
      console.debug('[LeetLog] Monaco extraction failed:', e);
    }

    try {
      const editorEl = document.querySelector('.view-lines, .monaco-editor-lines');
      if (editorEl) {
        const lines = Array.from(editorEl.querySelectorAll('.view-line'));
        const code = lines.map(l => l.textContent || '').join('\n');
        if (code.trim().length > 0) {
          return code;
        }
      }
    } catch (e) {
      console.debug('[LeetLog] DOM extraction failed:', e);
    }

    return null;
  }

  private resolveLanguage(code: string, detectedLanguage?: string): string {
    if (detectedLanguage && detectedLanguage !== 'unknown') {
      const normalized = detectedLanguage.toLowerCase();
      return this.languageMap[normalized] || normalized;
    }

    if (code.includes('def ') && code.includes(':')) return 'python';
    if (code.includes('function ') && (code.includes('=>') || code.includes('{'))) return 'javascript';
    if (code.includes('func ') && code.includes('package ')) return 'go';
    if (code.includes('fn ') && code.includes('let mut ')) return 'rust';
    if (code.includes('class ') && code.includes('public static void main')) return 'java';
    if (code.includes('#include') && code.includes('int main')) return 'cpp';
    if (code.includes('fn ') && code.includes('impl ')) return 'kotlin';
    if (code.includes('func ') && !code.includes('package ')) return 'swift';
    if (code.includes('def ') && code.includes('end')) return 'ruby';

    return 'unknown';
  }
}
