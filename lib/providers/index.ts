import { Provider } from '../types';
import { jooble } from './jooble';
import { careerjet } from './careerjet';
import { adzuna } from './adzuna';
import { arbeitnow } from './arbeitnow';
import { remotive } from './remotive';
import { jobicy } from './jobicy';

/** Para adicionar uma fonte: cria um ficheiro com um `Provider` e regista-o aqui. */
export const PROVIDERS: Provider[] = [jooble, careerjet, adzuna, arbeitnow, remotive, jobicy];

export const isConfigured = (p: Provider) => p.requiredEnv.every((k) => !!(process.env[k] || '').trim());
