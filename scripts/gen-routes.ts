import { writeGeneratedFiles } from '../src/router/elegant/generate.ts';

const { changed, sources } = writeGeneratedFiles();

console.log(
  `[elegant-router] ${changed ? 'wrote' : 'unchanged'} ${sources.files.length} page files → ${sources.routes.length} generated routes`
);
