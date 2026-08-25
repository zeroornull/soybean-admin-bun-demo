import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { parseCommitArgs, runCommitCli, type GitCommands } from './git-commit.ts';

function gitStub(staged: string[], commit = vi.fn(() => 0)): GitCommands {
  return {
    stagedFiles: () => staged,
    commit
  };
}

describe('parseCommitArgs', () => {
  it('reads flags and optional verify path', () => {
    expect(parseCommitArgs(['--dry-run', '--type', 'feat', '--scope', 'docs', '--description', 'add plan'])).toEqual({
      type: 'feat',
      scope: 'docs',
      description: 'add plan',
      dryRun: true,
      verify: null,
      help: false
    });
    expect(parseCommitArgs(['--verify']).verify).toBe('.git/COMMIT_EDITMSG');
    expect(parseCommitArgs(['--verify', 'msg.txt']).verify).toBe('msg.txt');
  });
});

describe('runCommitCli', () => {
  it('rejects an empty staging area', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const code = await runCommitCli(['--type', 'feat', '--scope', 'docs', '--description', 'x'], gitStub([]));
    expect(code).toBe(1);
    error.mockRestore();
  });

  it('prints a conventional message on dry-run without calling git commit', async () => {
    const commit = vi.fn(() => 0);
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const code = await runCommitCli(
      ['--dry-run', '--type', 'feat', '--scope', 'docs', '--description', 'add B02 plan'],
      gitStub(['docs/rounds/B02-git-commit.md'], commit)
    );

    expect(code).toBe(0);
    expect(commit).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('feat(docs): add B02 plan');
    log.mockRestore();
  });

  it('verifies a commit message file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'b02-commit-'));
    const okFile = join(dir, 'ok.txt');
    const badFile = join(dir, 'bad.txt');
    writeFileSync(okFile, 'feat(docs): add B02 plan\n');
    writeFileSync(badFile, 'updated stuff\n');

    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(await runCommitCli(['--verify', okFile], gitStub(['x']))).toBe(0);
    expect(await runCommitCli(['--verify', badFile], gitStub(['x']))).toBe(1);
    error.mockRestore();
  });
});
