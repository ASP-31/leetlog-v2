# 🧩 LeetLog

> **Your DSA journey, automatically logged to GitHub.**

LeetLog is a Chrome extension that automatically tracks your LeetCode progress and syncs your solutions to GitHub.

Instead of manually maintaining a Notion database, LeetLog turns your everyday LeetCode practice into a structured GitHub portfolio.

---

## ✨ What is LeetLog?

You solve a problem on LeetCode.

LeetLog detects the accepted submission, collects the relevant information, and synchronizes it with your GitHub repository.

```text
                 LeetCode
                    │
                    │ Accepted
                    ▼
             ┌─────────────┐
             │   LeetLog   │
             │  Extension  │
             └──────┬──────┘
                    │
             ┌──────┴──────┐
             ▼             ▼
         GitHub        Learning Data
         Solutions       Progress
             │             │
             ▼             ▼
        🟩 Activity     Dashboard
```

The goal is simple:

**Solve problems. Build skills. Build your GitHub.**

---

## 🚀 Features

### Automatic Solution Sync

Accepted LeetCode submissions can be automatically synchronized to your GitHub repository.

No more:

```text
Copy code
   ↓
Create file
   ↓
Write README
   ↓
Commit
   ↓
Push
```

LeetLog handles the repetitive work.

---

### 📊 DSA Progress Tracking

Track more than just the number of problems you've solved.

LeetLog can track:

* Problem number
* Problem title
* LeetCode URL
* Difficulty
* Topic
* Pattern
* Date solved
* Language
* Attempts
* Time taken
* Runtime
* Memory
* Confidence
* Mistakes
* What you learned
* Revision dates

---

### 🧠 Learn Patterns, Not Just Problems

LeetLog separates **topics** from **patterns**.

Example:

```text
Topic: Arrays

Patterns:
├── Sliding Window
├── Two Pointers
├── Prefix Sum
├── Hash Map
└── Binary Search
```

This makes it easier to understand which problem-solving techniques you actually know.

---

### 🔁 Revision Tracking

A problem isn't truly learned just because it was accepted once.

LeetLog can track problems that need to be revisited.

```text
Solved
  ↓
Revision
  ↓
Revision
  ↓
Revision
  ↓
Mastered
```

Problems can be scheduled for future revision based on your confidence and revision history.

---

### ⭐ Confidence Tracking

Track how well you actually understand a problem.

```text
⭐       Cannot solve
⭐⭐     Need significant help
⭐⭐⭐   Understand the approach
⭐⭐⭐⭐ Can solve independently
⭐⭐⭐⭐⭐ Can explain it to someone else
```

A solution being accepted does not necessarily mean you understand it.

LeetLog aims to track that difference.

---

## 🟩 GitHub-Native

Your GitHub repository becomes your DSA portfolio.

Example:

```text
LeetLog/
│
├── README.md
│
├── solutions/
│   ├── arrays/
│   ├── strings/
│   ├── binary-search/
│   ├── sliding-window/
│   ├── trees/
│   └── graphs/
│
├── notes/
│
└── metadata/
    └── progress.json
```

Your coding activity can naturally contribute to your GitHub activity graph.

**No fake commits. No contribution farming.**

The green squares represent actual learning activity.

---

## 📈 Dashboard

LeetLog will provide a quick overview of your DSA progress.

Example:

```text
🧩 LEETLOG

🔥 18 Day Streak

127 Problems Solved

Easy        64
Medium      55
Hard         8

Top Patterns

Binary Search       23
Sliding Window      18
Two Pointers        16

Revision

🔴 3 due today
🟡 5 this week
```

---

## 🎯 Philosophy

Most LeetCode trackers answer:

> **"How many problems did you solve?"**

LeetLog aims to answer:

> **"What did you actually learn?"**

A good DSA tracker should show:

```text
Problems
    ↓
Patterns
    ↓
Mistakes
    ↓
Revision
    ↓
Confidence
    ↓
Improvement
```

---

## 🛠️ Tech Stack

Initial technology direction:

* Chrome Extension
* Manifest V3
* JavaScript / TypeScript
* GitHub API
* Chrome Storage
* LeetCode content scripts

The exact stack may evolve during development.

---

## 🗺️ Roadmap

### Phase 1 — Foundation ✅

* [x] Chrome Extension setup
* [x] Manifest V3
* [x] LeetCode problem detection
* [x] Extension popup
* [x] Settings

### Phase 2 — LeetCode Integration ✅

* [x] Detect submissions
* [x] Detect Accepted status
* [x] Extract problem metadata
* [x] Extract submitted code
* [x] Detect programming language
* [x] Track attempts

### Phase 3 — GitHub Integration ✅

* [x] GitHub authentication
* [x] Repository selection
* [x] Automatic solution commits
* [x] Repository structure
* [x] Duplicate handling
* [x] Sync retry system

### Phase 4 — Learning Layer ✅

* [x] Topic tracking
* [x] Pattern tracking
* [x] Confidence
* [x] Mistakes
* [x] Learning notes
* [x] Revision tracking

### Phase 5 — Dashboard ✅

* [x] Total problems
* [x] Difficulty statistics
* [x] Topic statistics
* [x] Pattern statistics
* [x] Streak
* [x] Revision queue
* [x] Weekly activity

### Phase 6 — Expansion 🚧

* [ ] AI-assisted pattern detection
* [ ] Better analytics
* [ ] Multiple programming platforms
* [ ] Public LeetLog profiles
* [ ] Web dashboard

---

## 🔐 Privacy

LeetLog is designed with a privacy-first approach.

The project should:

* Request minimal permissions
* Keep user data under user control
* Avoid unnecessary external servers
* Never expose GitHub credentials
* Never commit authentication tokens
* Avoid collecting unnecessary personal data

---

## 🤝 Contributing

Contributions are welcome.

If you find a bug, have an idea, or want to improve LeetLog:

1. Fork the repository.
2. Create a branch.
3. Make your changes.
4. Test them.
5. Open a pull request.

---

## 📌 Project Status

🚀 **LeetLog V2 is actively developed.**

Core pipeline is functional:

**LeetCode → Chrome Extension → GitHub**

with the learning and analytics layer (Phases 4-5) built on top.

**Note:** GitHub sync requires a [Personal Access Token](https://github.com/settings/tokens) with `repo` scope. Enter it in the Settings tab of the extension.

---

## 🌟 Vision

LeetLog started with a simple problem:

> **Keeping track of DSA practice manually is annoying.**

The long-term goal is to make that process automatic.

```text
             Solve
               ↓
            LeetLog
               ↓
       ┌───────┴───────┐
       ↓               ↓
     GitHub          Learning
    Portfolio        History
       ↓               ↓
    🟩 Activity     📈 Progress
```

### **Solve problems. Learn patterns. Build in public.**

---

Made for developers who want their DSA journey to be more than a list of solved problems.
