import React, { useState, useEffect } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '../../types/settings';
import { GitHubAuth } from '../../github/auth';
import { storage } from '../../utils/storage';
import { Settings, LogOut, ExternalLink } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const saved = await storage.get('settings');
    setSettings(saved);

    if (saved.githubToken) {
      const auth = new GitHubAuth();
      const valid = await auth.validateToken(saved.githubToken);
      if (valid) {
        const user = await auth.getUser(saved.githubToken);
        setConnected(true);
        setUsername(user?.login || '');
      }
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    const auth = new GitHubAuth();
    try {
      const token = await auth.authenticate();
      const updated = { ...settings, githubToken: token };
      setSettings(updated);
      await storage.set('settings', updated);

      const user = await auth.getUser(token);
      setConnected(true);
      setUsername(user?.login || '');
    } catch (err) {
      console.error('GitHub auth failed:', err);
    }
  };

  const handleDisconnect = async () => {
    const auth = new GitHubAuth();
    await auth.logout();
    const updated = { ...settings, githubToken: '' };
    setSettings(updated);
    setConnected(false);
    setUsername('');
  };

  const handleSave = async () => {
    await storage.set('settings', settings);
  };

  const updateRevisionSchedule = (value: string) => {
    const days = value.split(',').map(d => parseInt(d.trim(), 10)).filter(d => !isNaN(d) && d > 0);
    setSettings({ ...settings, revisionSchedule: days });
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="empty-state">
          <p className="empty-desc">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="card">
        <div className="card-title">
          <Settings size={14} /> Settings
        </div>

        <div className="settings-section">
          <div className="settings-label">GitHub</div>
          {connected ? (
            <div className="github-connected">
              <div className="github-info">
                <span className="github-avatar">✓</span>
                <span>{username}</span>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={handleDisconnect}>
                <LogOut size={12} /> Disconnect
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleConnect}>
              <ExternalLink size={12} /> Connect GitHub
            </button>
          )}
        </div>

        <div className="settings-section">
          <div className="settings-label">Repository</div>
          <input
            className="settings-input"
            type="text"
            placeholder="owner/repo"
            value={settings.githubRepo}
            onChange={(e) => setSettings({ ...settings, githubRepo: e.target.value })}
            onBlur={handleSave}
          />
        </div>

        <div className="settings-section">
          <div className="settings-label">Branch</div>
          <input
            className="settings-input"
            type="text"
            placeholder="main"
            value={settings.githubBranch}
            onChange={(e) => setSettings({ ...settings, githubBranch: e.target.value })}
            onBlur={handleSave}
          />
        </div>

        <div className="settings-section">
          <div className="settings-label">Solution Directory</div>
          <input
            className="settings-input"
            type="text"
            placeholder="solutions"
            value={settings.solutionDirectory}
            onChange={(e) => setSettings({ ...settings, solutionDirectory: e.target.value })}
            onBlur={handleSave}
          />
        </div>

        <div className="settings-section">
          <div className="settings-label">Auto Sync</div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.autoSync}
              onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
              onBlur={handleSave}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="settings-section">
          <div className="settings-label">Revision Schedule (days)</div>
          <input
            className="settings-input"
            type="text"
            placeholder="1, 3, 7, 14, 30"
            value={settings.revisionSchedule.join(', ')}
            onChange={(e) => updateRevisionSchedule(e.target.value)}
            onBlur={handleSave}
          />
        </div>
      </div>
    </div>
  );
};
