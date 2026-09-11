export const TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks',
  'Queues',
  'Hash Tables',
  'Trees',
  'Binary Trees',
  'BST',
  'Heaps',
  'Graphs',
  'Tries',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Binary Search',
  'Sorting',
  'Bit Manipulation',
  'Math',
  'Design',
] as const;

export type Topic = (typeof TOPICS)[number];

export const PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'BFS',
  'DFS',
  'Hash Map',
  'Prefix Sum',
  'Monotonic Stack',
  'Backtracking',
  'Divide and Conquer',
  'Dynamic Programming',
  'Greedy',
  'Union Find',
  'Topological Sort',
  'Bit Manipulation',
  'Fast and Slow Pointers',
  'Kadane\'s Algorithm',
  'Merge Intervals',
  'In-place Reversal',
  'K-way Merge',
] as const;

export type Pattern = (typeof PATTERNS)[number];
