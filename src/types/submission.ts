export interface SubmissionResult {
  accepted: boolean;
  language: string;
  runtime?: number;
  memory?: number;
  statusText: string;
}

export interface CodeExtracted {
  code: string;
  language: string;
}
