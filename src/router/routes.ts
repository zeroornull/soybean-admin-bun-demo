import { groupAuthElegantRoutes, splitGeneratedRoutes } from './elegant/assemble';
import { createNotFoundRoute } from './elegant/to-const';
import { generatedRoutes } from './elegant/routes';
import { layouts, views } from './elegant/imports';
import { transformElegantRoutesToVueRoutes } from './elegant/transform';

const { constantRoutes: generatedConstantRoutes, authRoutes: generatedAuthRoutes } =
  splitGeneratedRoutes(generatedRoutes);

export const constantRoutes = [
  ...transformElegantRoutesToVueRoutes(generatedConstantRoutes, layouts, views),
  ...transformElegantRoutesToVueRoutes([createNotFoundRoute()], layouts, views)
];

export const authRoutes = transformElegantRoutesToVueRoutes(
  groupAuthElegantRoutes(generatedAuthRoutes),
  layouts,
  views
);

export const routes = constantRoutes;
