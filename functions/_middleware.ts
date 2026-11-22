/**
 * Runs on every Pages request, including static files. Public responses are
 * returned untouched unless the request actually presents an Access token.
 */

import type { GateEnv } from './lib/access.ts';
import { handleGate } from './lib/gate.ts';

interface MiddlewareContext {
  request: Request;
  env: GateEnv;
  next: () => Promise<Response>;
}

export function onRequest(context: MiddlewareContext): Promise<Response> {
  return handleGate(context.request, context.env, () => context.next());
}
