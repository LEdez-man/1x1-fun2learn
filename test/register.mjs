// Löst den Bare-Import 'three' im Test auf die mitgelieferte Bibliothek auf (kein npm nötig).
import { registerHooks } from 'node:module';

const THREE_URL = new URL('../vendor/three.module.min.js', import.meta.url).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'three') return { url: THREE_URL, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
