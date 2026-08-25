import { describe, expect, it } from 'vitest';
import { formatCommitMessage, isConventionalCommit } from './commit-message';

describe('formatCommitMessage', () => {
  it('formats type(scope): description and treats ! as breaking', () => {
    expect(formatCommitMessage({ type: 'feat', scope: 'docs', description: 'add B02 plan' })).toBe(
      'feat(docs): add B02 plan'
    );
    expect(formatCommitMessage({ type: 'fix', scope: 'auth', description: '! drop silent modal logout' })).toBe(
      'fix(auth)!: drop silent modal logout'
    );
  });

  it('rejects unknown type/scope and empty descriptions', () => {
    expect(() => formatCommitMessage({ type: 'wip', scope: 'docs', description: 'nope' })).toThrow(
      /Unknown commit type/
    );
    expect(() => formatCommitMessage({ type: 'feat', scope: 'frontend', description: 'nope' })).toThrow(
      /Unknown commit scope/
    );
    expect(() => formatCommitMessage({ type: 'feat', scope: 'docs', description: '   !   ' })).toThrow(
      /description is required/
    );
  });
});

describe('isConventionalCommit', () => {
  it('accepts conventional, merge and revert first lines', () => {
    expect(isConventionalCommit('feat(docs): add B02 plan')).toBe(true);
    expect(isConventionalCommit('fix(auth)!: drop silent modal logout\n\nbody')).toBe(true);
    expect(isConventionalCommit('Merge branch master')).toBe(true);
    expect(isConventionalCommit('Revert "feat(docs): add B02 plan"')).toBe(true);
    expect(isConventionalCommit('updated stuff')).toBe(false);
  });
});
