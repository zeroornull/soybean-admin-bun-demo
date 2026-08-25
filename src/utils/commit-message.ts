export const commitTypes = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert'
] as const;

export const commitScopes = ['auth', 'router', 'request', 'layout', 'packages', 'docs', 'scripts', 'other'] as const;

export type CommitType = (typeof commitTypes)[number];
export type CommitScope = (typeof commitScopes)[number];

export interface CommitMessageInput {
  type: string;
  scope: string;
  description: string;
}

const conventionalPattern = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<description>.+)$/i;

function isCommitType(value: string): value is CommitType {
  return (commitTypes as readonly string[]).includes(value);
}

function isCommitScope(value: string): value is CommitScope {
  return (commitScopes as readonly string[]).includes(value);
}

export function formatCommitMessage(input: CommitMessageInput) {
  if (!isCommitType(input.type)) {
    throw new Error(`Unknown commit type "${input.type}". Use one of: ${commitTypes.join(', ')}`);
  }

  if (!isCommitScope(input.scope)) {
    throw new Error(`Unknown commit scope "${input.scope}". Use one of: ${commitScopes.join(', ')}`);
  }

  const trimmed = input.description.trim();
  const breaking = trimmed.startsWith('!');
  const description = trimmed.replace(/^!/, '').trim();

  if (!description) {
    throw new Error('Commit description is required');
  }

  return `${input.type}(${input.scope})${breaking ? '!' : ''}: ${description}`;
}

export function isConventionalCommit(message: string) {
  const firstLine = message.trim().split('\n')[0] || '';

  if (/^(Merge|Revert)\b/i.test(firstLine)) return true;

  return conventionalPattern.test(firstLine);
}
