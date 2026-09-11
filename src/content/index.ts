import { LeetCodeDetector } from './detector';
import { SubmissionDetector } from './submission-detector';
import { CodeExtractor } from './code-extractor';
import { ProblemDetectedMessage, SubmissionDetectedMessage } from '../types/messages';
import { DetectedProblem } from '../types/problem';

console.log('[LeetLog] Content script initialized on', window.location.href);

let currentProblem: DetectedProblem | null = null;
const codeExtractor = new CodeExtractor();

const detector = new LeetCodeDetector(async (problem) => {
  console.log('[LeetLog] Problem detected:', problem);
  currentProblem = problem;

  const message: ProblemDetectedMessage = {
    type: 'PROBLEM_DETECTED',
    payload: problem,
  };

  try {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.debug('[LeetLog] Background message error:', chrome.runtime.lastError.message);
      } else {
        console.log('[LeetLog] Background acknowledged:', response);
      }
    });
  } catch (err) {
    console.warn('[LeetLog] Could not send message to background:', err);
  }
});

const submissionDetector = new SubmissionDetector(async (submission) => {
  if (!currentProblem) {
    console.debug('[LeetLog] Submission detected but no active problem');
    return;
  }

  if (!submission.accepted) {
    console.log('[LeetLog] Non-accepted submission, skipping');
    return;
  }

  const extracted = codeExtractor.extract(submission.language);
  if (!extracted) {
    console.warn('[LeetLog] Could not extract code from editor');
    return;
  }

  console.log('[LeetLog] Accepted submission detected, code extracted');

  const message: SubmissionDetectedMessage = {
    type: 'SUBMISSION_DETECTED',
    payload: {
      problem: currentProblem,
      submission: {
        ...submission,
        language: extracted.language,
      },
      code: extracted.code,
    },
  };

  try {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.debug('[LeetLog] Submission message error:', chrome.runtime.lastError.message);
      } else {
        console.log('[LeetLog] Background processed submission:', response);
      }
    });
  } catch (err) {
    console.warn('[LeetLog] Could not send submission to background:', err);
  }
});

detector.startObserving();
submissionDetector.startObserving();
