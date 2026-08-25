import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFileSync } from 'node:fs';
import {
  commitScopes,
  commitTypes,
  formatCommitMessage,
  isConventionalCommit,
  type CommitMessageInput
} from '../src/utils/commit-message.ts';

export interface CommitCliOptions {
  type?: string;
  scope?: string;
  description?: string;
  dryRun: boolean;
  verify: string | null;
  help: boolean;
}

export interface GitCommands {
  stagedFiles: () => string[];
  commit: (message: string) => number;
}

const typeHelp: Record<(typeof commitTypes)[number], string> = {
  feat: '新功能',
  fix: '修复',
  docs: '文档',
  style: '格式',
  refactor: '重构',
  perf: '性能',
  test: '测试',
  build: '构建',
  ci: 'CI',
  chore: '杂项',
  revert: '回滚'
};

const scopeHelp: Record<(typeof commitScopes)[number], string> = {
  auth: '登录与会话',
  router: '路由与守卫',
  request: '请求与 Mock',
  layout: '布局与主题',
  packages: '内部包',
  docs: '文档',
  scripts: '脚本与工具',
  other: '其他'
};

export function parseCommitArgs(argv: string[]): CommitCliOptions {
  const options: CommitCliOptions = {
    dryRun: false,
    verify: null,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }

    if (argument === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (argument === '--type') {
      options.type = argv[index + 1];
      index += 1;
      continue;
    }

    if (argument === '--scope') {
      options.scope = argv[index + 1];
      index += 1;
      continue;
    }

    if (argument === '--description' || argument === '--desc') {
      options.description = argv[index + 1];
      index += 1;
      continue;
    }

    if (argument === '--verify') {
      const next = argv[index + 1];
      if (next && !next.startsWith('-')) {
        options.verify = next;
        index += 1;
      } else {
        options.verify = '.git/COMMIT_EDITMSG';
      }
    }
  }

  return options;
}

export function createGitCommands(): GitCommands {
  return {
    stagedFiles() {
      const result = spawnSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' });

      if (result.status) {
        throw new Error(result.stderr.trim() || 'git diff --cached failed');
      }

      return result.stdout
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
    },
    commit(message) {
      const result = spawnSync('git', ['commit', '-m', message], { stdio: 'inherit' });
      return result.status ?? 1;
    }
  };
}

function printHelp() {
  console.log(`Usage:
  bun run commit
  bun run commit -- --type feat --scope docs --description "add B02 plan"
  bun run commit -- --dry-run --type fix --scope auth --description "keep session on cancel"
  bun run commit -- --verify
`);
}

async function promptChoice(question: string, choices: string[]) {
  console.log(question);
  choices.forEach((choice, index) => {
    console.log(`  ${index + 1}. ${choice}`);
  });

  const rl = createInterface({ input, output });
  const answer = (await rl.question('> ')).trim();
  rl.close();

  const byNumber = Number(answer);
  if (Number.isInteger(byNumber) && byNumber >= 1 && byNumber <= choices.length) {
    return choices[byNumber - 1]!;
  }

  if (choices.includes(answer)) return answer;

  throw new Error(`Invalid choice "${answer}"`);
}

async function promptText(question: string) {
  const rl = createInterface({ input, output });
  const answer = (await rl.question(`${question}\n> `)).trim();
  rl.close();
  return answer;
}

function firstWord(value: string) {
  return value.trim().split(/\s+/)[0] || '';
}

async function collectMessage(options: CommitCliOptions): Promise<CommitMessageInput> {
  const type =
    options.type ??
    firstWord(
      await promptChoice(
        '选择提交类型',
        commitTypes.map(value => `${value.padEnd(10)} ${typeHelp[value]}`)
      )
    );
  const scope =
    options.scope ??
    firstWord(
      await promptChoice(
        '选择提交范围',
        commitScopes.map(value => `${value.padEnd(10)} ${scopeHelp[value]}`)
      )
    );
  const description = options.description ?? (await promptText('描述（! 开头表示破坏性改动）'));

  return { type, scope, description };
}

export async function runCommitCli(argv: string[], git: GitCommands = createGitCommands()) {
  const options = parseCommitArgs(argv);

  if (options.help) {
    printHelp();
    return 0;
  }

  if (options.verify) {
    try {
      const message = readFileSync(options.verify, 'utf8');
      if (!isConventionalCommit(message)) {
        console.error('git commit message must match Conventional Commits: type(scope): description');
        return 1;
      }
    } catch {
      console.error(`Unable to read commit message file: ${options.verify}`);
      return 1;
    }

    return 0;
  }

  const staged = git.stagedFiles();

  if (!staged.length) {
    console.error('暂存区没有文件，请先 git add 再提交。');
    return 1;
  }

  const needsPrompt = !options.type || !options.scope || !options.description;

  if (needsPrompt && !input.isTTY) {
    console.error('非交互模式必须提供 --type --scope --description。');
    return 2;
  }

  let message: string;

  try {
    message = formatCommitMessage(await collectMessage(options));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }

  console.log(message);

  if (options.dryRun) return 0;

  return git.commit(message);
}

const cliEntry = (process.argv[1] || '').replaceAll('\\', '/');

if (cliEntry.endsWith('/scripts/git-commit.ts') || cliEntry.endsWith('/scripts/git-commit')) {
  void runCommitCli(process.argv.slice(2)).then(code => process.exit(code));
}
