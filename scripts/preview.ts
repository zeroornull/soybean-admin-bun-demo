import { runWithLocalMock } from './local-stack';

void runWithLocalMock({
  label: 'preview',
  viteArgs: ['preview', '--mode', 'prod']
});
