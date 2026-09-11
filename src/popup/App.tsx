import React, { useEffect, useState } from 'react';
import { DetectedProblem, SolvedProblem } from '../types/problem';
import { GetCurrentProblemMessage, GetCurrentProblemResponse } from '../types/messages';
import { storage } from '../utils/storage';
import { ConfidenceRating } from './components/ConfidenceRating';
import { TopicPicker } from './components/TopicPicker';
import { PatternPicker } from './components/PatternPicker';
import { NotesEditor } from './components/NotesEditor';
import { RevisionBadge } from './components/RevisionBadge';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/SettingsPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  Code2,
  ExternalLink,
  RefreshCw,
  Compass,
  BarChart3,
  Settings,
  CheckCircle2,
} from 'lucide-react';

type Tab = 'active' | 'dashboard' | 'settings';

export const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>('active');
  const [problem, setProblem] = useState<DetectedProblem | null>(null);
  const [solvedProblem, setSolvedProblem] = useState<SolvedProblem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'monitoring' | 'synced' | 'idle'>('idle');
  const [showMetadataForm, setShowMetadataForm] = useState(false);

  const fetchActiveProblem = async () => {
    setLoading(true);
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        const msg: GetCurrentProblemMessage = { type: 'GET_CURRENT_PROBLEM' };
        chrome.runtime.sendMessage(msg, (response: GetCurrentProblemResponse) => {
          if (chrome.runtime.lastError || !response?.payload) {
            storage.get('activeProblem').then((stored) => {
              setProblem(stored);
              setSyncStatus(stored ? 'monitoring' : 'idle');
              setLoading(false);
              checkIfSolved(stored);
            });
          } else {
            setProblem(response.payload.problem);
            setSyncStatus(response.payload.problem ? 'monitoring' : 'idle');
            setLoading(false);
            checkIfSolved(response.payload.problem);
          }
        });
      } else {
        const stored = await storage.get('activeProblem');
        setProblem(stored);
        setSyncStatus(stored ? 'monitoring' : 'idle');
        setLoading(false);
        checkIfSolved(stored);
      }
    } catch (err) {
      console.error('Failed to fetch active problem:', err);
      setLoading(false);
    }
  };

  const checkIfSolved = async (detected: DetectedProblem | null) => {
    if (!detected) {
      setSolvedProblem(null);
      return;
    }
    const solved = await storage.getSolvedProblem(detected.titleSlug);
    setSolvedProblem(solved);
  };

  useEffect(() => {
    fetchActiveProblem();

    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.activeProblem) {
          const newProblem = changes.activeProblem.newValue as DetectedProblem | null;
          setProblem(newProblem);
          setSyncStatus(newProblem ? 'monitoring' : 'idle');
          checkIfSolved(newProblem);
        }
        if (changes.problems) {
          setSolvedProblem((current) => {
            const problems = changes.problems.newValue as SolvedProblem[];
            if (!current) return current;
            return problems.find(p => p.titleSlug === current.titleSlug) ?? current;
          });
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  }, []);

  const handleMetadataSave = async () => {
    if (!solvedProblem) return;
    await storage.upsertSolvedProblem(solvedProblem);
    setShowMetadataForm(false);
  };

  const updateMetadata = (updates: Partial<Pick<SolvedProblem, 'topics' | 'patterns' | 'confidence' | 'notes' | 'mistakes'>>) => {
    if (!solvedProblem) return;
    setSolvedProblem({ ...solvedProblem, ...updates });
  };

  const getDifficultyClass = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'tag-easy';
      case 'medium': return 'tag-medium';
      case 'hard': return 'tag-hard';
      default: return 'tag-medium';
    }
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <header className="header">
          <div className="brand">
            <span className="brand-icon">🧩</span>
            <h1 className="brand-title">LeetLog</h1>
          </div>
          <div className="header-actions">
            <button
              onClick={fetchActiveProblem}
              title="Refresh"
              className="icon-btn"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        <nav className="tab-nav">
          <button
            className={`tab-btn ${tab === 'active' ? 'active' : ''}`}
            onClick={() => setTab('active')}
          >
            <Code2 size={14} />
            Active
          </button>
          <button
            className={`tab-btn ${tab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setTab('dashboard')}
          >
            <BarChart3 size={14} />
            Dashboard
          </button>
          <button
            className={`tab-btn ${tab === 'settings' ? 'active' : ''}`}
            onClick={() => setTab('settings')}
          >
            <Settings size={14} />
            Settings
          </button>
        </nav>

        {tab === 'active' && (
          <div className="tab-content">
            <div className="status-badge">
              <span className={`status-dot ${syncStatus === 'monitoring' ? 'active' : ''}`} />
              <span>
                {syncStatus === 'monitoring' ? 'Monitoring LeetCode tab' : 'Waiting for LeetCode tab'}
              </span>
            </div>

            <div className="card">
              <div className="card-title">
                <Code2 size={14} /> Active Problem
              </div>

              {loading ? (
                <div className="empty-state">
                  <p className="empty-desc">Checking active tab...</p>
                </div>
              ) : problem ? (
                <div>
                  <h2 className="problem-title">{problem.title}</h2>
                  <div className="problem-meta">
                    <span className={`tag ${getDifficultyClass(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <span className="tag tag-slug">{problem.titleSlug}</span>
                  </div>
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="problem-link"
                  >
                    <span>View on LeetCode</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <p className="empty-title">No Problem Detected</p>
                  <p className="empty-desc">
                    Open any problem on <strong>leetcode.com/problems/*</strong> to begin tracking.
                  </p>
                </div>
              )}
            </div>

            {solvedProblem && (
              <div className="card">
                <div className="card-title">
                  <CheckCircle2 size={14} /> Solved
                </div>
                <div className="solved-info">
                  <span className="tag tag-solved">Solved</span>
                  <span className="solved-lang">{solvedProblem.language}</span>
                  <RevisionBadge problem={solvedProblem} />
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowMetadataForm(!showMetadataForm)}
                >
                  {showMetadataForm ? 'Cancel' : 'Add Metadata'}
                </button>

                {showMetadataForm && (
                  <div className="metadata-form">
                    <ConfidenceRating
                      value={solvedProblem.confidence}
                      onChange={(v) => updateMetadata({ confidence: v })}
                    />
                    <TopicPicker
                      selected={solvedProblem.topics}
                      onChange={(topics) => updateMetadata({ topics })}
                    />
                    <PatternPicker
                      selected={solvedProblem.patterns}
                      onChange={(patterns) => updateMetadata({ patterns })}
                    />
                    <NotesEditor
                      notes={solvedProblem.notes}
                      mistakes={solvedProblem.mistakes}
                      onNotesChange={(notes) => updateMetadata({ notes })}
                      onMistakesChange={(mistakes) => updateMetadata({ mistakes })}
                    />
                    <button className="btn btn-primary btn-save" onClick={handleMetadataSave}>
                      Save Metadata
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="roadmap-box">
              <div className="roadmap-title">
                <Compass size={14} /> Phase 2-5 Active
              </div>
              <p className="roadmap-desc">
                Submission detection, GitHub sync, learning metadata, and dashboard are now live.
              </p>
            </div>
          </div>
        )}

        {tab === 'dashboard' && (
          <div className="tab-content">
            <Dashboard />
          </div>
        )}

        {tab === 'settings' && (
          <div className="tab-content">
            <SettingsPage />
          </div>
        )}

        <footer className="footer">
          <span>LeetLog V2</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <span>GitHub</span>
            <ExternalLink size={10} />
          </a>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
