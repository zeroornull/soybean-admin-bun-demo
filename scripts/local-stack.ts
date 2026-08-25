import { spawn, type ChildProcess } from 'node:child_process';
import { resolve } from 'node:path';

const mockHealthUrl = 'http://127.0.0.1:19007/health';
const mockStartupTimeout = 5_000;
const shutdownTimeout = 2_000;
const isWindows = process.platform === 'win32';

export interface LocalStackOptions {
  label: 'dev' | 'preview';
  viteArgs: string[];
}

export async function runWithLocalMock(options: LocalStackOptions) {
  const { label, viteArgs } = options;
  let mockProcess: ChildProcess | undefined;
  let viteProcess: ChildProcess | undefined;
  let shuttingDown = false;

  function delay(milliseconds: number) {
    return new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds));
  }

  async function isMockReady() {
    try {
      const response = await fetch(mockHealthUrl, {
        signal: AbortSignal.timeout(500)
      });

      if (!response.ok) return false;

      const body = (await response.json()) as {
        code?: unknown;
        data?: { service?: unknown };
      };

      return body.code === '0000' && body.data?.service === 'soybean-local-mock';
    } catch {
      return false;
    }
  }

  function viteProcessEnv() {
    const env = { ...process.env };

    // Bun preloads `.env` into process.env. Vite must read mode-specific files itself.
    for (const key of Object.keys(env)) {
      if (key.startsWith('VITE_')) delete env[key];
    }

    return env;
  }

  function startChild(command: string, arguments_: string[]) {
    const child = spawn(command, arguments_, {
      cwd: process.cwd(),
      detached: !isWindows,
      env: command.includes('vite') ? viteProcessEnv() : process.env,
      stdio: 'inherit'
    });

    child.once('error', error => {
      console.error(`[${label}] failed to start ${command}:`, error);

      if (!shuttingDown) void shutdown(1);
    });

    return child;
  }

  function signalChild(child: ChildProcess | undefined, signal: NodeJS.Signals) {
    if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;

    try {
      if (isWindows) {
        child.kill(signal);
      } else {
        process.kill(-child.pid, signal);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
        console.error(`[${label}] failed to send ${signal} to child ${child.pid}:`, error);
      }
    }
  }

  function waitForExit(child: ChildProcess) {
    if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();

    return new Promise<void>(resolveExit => {
      child.once('exit', () => resolveExit());
    });
  }

  async function shutdown(exitCode: number) {
    if (shuttingDown) return;

    shuttingDown = true;
    const children = [viteProcess, mockProcess].filter((child): child is ChildProcess => Boolean(child));

    for (const child of children) signalChild(child, 'SIGTERM');

    await Promise.race([Promise.all(children.map(waitForExit)), delay(shutdownTimeout)]);

    for (const child of children) signalChild(child, 'SIGKILL');

    process.exit(exitCode);
  }

  async function waitForMockReady(child: ChildProcess) {
    const deadline = Date.now() + mockStartupTimeout;

    while (Date.now() < deadline) {
      if (await isMockReady()) return;

      if (child.exitCode !== null || child.signalCode !== null) {
        throw new Error('local Mock exited before becoming ready');
      }

      await delay(100);
    }

    throw new Error(`local Mock did not become ready within ${mockStartupTimeout}ms`);
  }

  function watchUnexpectedExit(name: string, child: ChildProcess) {
    child.once('exit', (code, signal) => {
      if (shuttingDown) return;

      const detail = signal ? `signal ${signal}` : `code ${code ?? 'unknown'}`;
      console.error(`[${label}] ${name} exited unexpectedly (${detail})`);
      void shutdown(1);
    });
  }

  process.once('SIGINT', () => void shutdown(130));
  process.once('SIGTERM', () => void shutdown(143));

  try {
    if (await isMockReady()) {
      console.log(`[${label}] reusing local Mock at ${mockHealthUrl}`);
    } else {
      console.log(`[${label}] local Mock is not running; starting it now`);
      mockProcess = startChild(process.execPath, ['scripts/mock-service.ts']);
      await waitForMockReady(mockProcess);
      console.log(`[${label}] local Mock is ready at ${mockHealthUrl}`);
      watchUnexpectedExit('local Mock', mockProcess);
    }

    const viteExecutable = resolve('node_modules', '.bin', isWindows ? 'vite.cmd' : 'vite');

    viteProcess = startChild(viteExecutable, viteArgs);
    watchUnexpectedExit('Vite', viteProcess);
  } catch (error) {
    console.error(`[${label}] startup failed:`, error);
    await shutdown(1);
  }
}
