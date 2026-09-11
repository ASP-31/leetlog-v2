import { DetectedProblem, SolvedProblem } from './problem';
import { SubmissionResult } from './submission';
import { UserSettings, StreakData } from './settings';
import { SyncJob } from './github';

export type MessageType =
  | 'PROBLEM_DETECTED'
  | 'GET_CURRENT_PROBLEM'
  | 'GET_CURRENT_PROBLEM_RESPONSE'
  | 'SUBMISSION_DETECTED'
  | 'GET_SOLVED_PROBLEMS'
  | 'GET_SOLVED_PROBLEMS_RESPONSE'
  | 'UPDATE_PROBLEM_METADATA'
  | 'GET_SETTINGS'
  | 'GET_SETTINGS_RESPONSE'
  | 'SAVE_SETTINGS'
  | 'SYNC_TO_GITHUB'
  | 'SYNC_STATUS_UPDATE'
  | 'GET_STREAK'
  | 'GET_STREAK_RESPONSE';

export interface ProblemDetectedMessage {
  type: 'PROBLEM_DETECTED';
  payload: DetectedProblem;
}

export interface GetCurrentProblemMessage {
  type: 'GET_CURRENT_PROBLEM';
}

export interface GetCurrentProblemResponse {
  type: 'GET_CURRENT_PROBLEM_RESPONSE';
  payload: {
    problem: DetectedProblem | null;
  };
}

export interface SubmissionDetectedMessage {
  type: 'SUBMISSION_DETECTED';
  payload: {
    problem: DetectedProblem;
    submission: SubmissionResult;
    code: string;
  };
}

export interface GetSolvedProblemsMessage {
  type: 'GET_SOLVED_PROBLEMS';
}

export interface GetSolvedProblemsResponse {
  type: 'GET_SOLVED_PROBLEMS_RESPONSE';
  payload: {
    problems: SolvedProblem[];
  };
}

export interface UpdateProblemMetadataMessage {
  type: 'UPDATE_PROBLEM_METADATA';
  payload: {
    titleSlug: string;
    updates: Partial<Pick<SolvedProblem, 'topics' | 'patterns' | 'confidence' | 'notes' | 'mistakes' | 'needsRevision'>>;
  };
}

export interface GetSettingsMessage {
  type: 'GET_SETTINGS';
}

export interface GetSettingsResponse {
  type: 'GET_SETTINGS_RESPONSE';
  payload: {
    settings: UserSettings;
  };
}

export interface SaveSettingsMessage {
  type: 'SAVE_SETTINGS';
  payload: UserSettings;
}

export interface SyncToGithubMessage {
  type: 'SYNC_TO_GITHUB';
  payload: {
    titleSlug: string;
  };
}

export interface SyncStatusUpdateMessage {
  type: 'SYNC_STATUS_UPDATE';
  payload: {
    job: SyncJob;
  };
}

export interface GetStreakMessage {
  type: 'GET_STREAK';
}

export interface GetStreakResponse {
  type: 'GET_STREAK_RESPONSE';
  payload: {
    streak: StreakData;
  };
}

export type ExtensionMessage =
  | ProblemDetectedMessage
  | GetCurrentProblemMessage
  | GetCurrentProblemResponse
  | SubmissionDetectedMessage
  | GetSolvedProblemsMessage
  | GetSolvedProblemsResponse
  | UpdateProblemMetadataMessage
  | GetSettingsMessage
  | GetSettingsResponse
  | SaveSettingsMessage
  | SyncToGithubMessage
  | SyncStatusUpdateMessage
  | GetStreakMessage
  | GetStreakResponse;
