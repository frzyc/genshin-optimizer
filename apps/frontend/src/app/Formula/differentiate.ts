import { assertUnreachable } from '../Util/Util';
import { forEachNodes } from './internal';
import { constant, sum, prod, threshold, frac, max, min } from './utils';
import type { ReadNode } from './type';
import type { OptNode } from './optimization';

export function zero_deriv(funct: OptNode, binding: (readNode: ReadNode<number>) => string, diff: string): boolean {
  let ret = true;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  forEachNodes([funct], (_) => { }, (f) => {
    const { operation } = f;
    switch (operation) {
      case 'read':
        if (f.type !== 'number' || (f.accu && f.accu !== 'add'))
          throw new Error(`Unsupported [${operation}] node in zero_deriv`);
        if (binding(f) === diff) ret = false;
    }
  });
  return ret;
}

export function ddx(f: OptNode, binding: (readNode: ReadNode<number>) => string, diff: string): OptNode {
  const { operation } = f;
  switch (operation) {
    case 'read': {
      if (f.type !== 'number' || (f.accu && f.accu !== 'add'))
        throw new Error(`Unsupported [${operation}] node in d/dx`);
      const name = binding(f);
      if (name === diff) return constant(1);
      return constant(0);
    }
    case 'const': return constant(0);
    case 'res':
      if (!zero_deriv(f, binding, diff))
        throw new Error(`[${operation}] node takes only constant inputs. ${f}`);
      return constant(0);

    case 'add':
      return sum(...f.operands.map((fi) => ddx(fi, binding, diff)));
    case 'mul': {
      const ops = f.operands.map((fi, i) => prod(ddx(fi, binding, diff), ...f.operands.filter((v, ix) => ix !== i)));
      return sum(...ops);
    }
    case 'sum_frac': {
      const a = f.operands[0];
      const da = ddx(a, binding, diff);
      const b = sum(...f.operands.slice(1));
      const db = ddx(b, binding, diff);
      const denom = prod(sum(...f.operands), sum(...f.operands));
      const numerator = sum(prod(b, da), prod(-1, a, db));
      return frac(numerator, sum(prod(-1, numerator), denom));
    }

    case 'min': case 'max': {
      if (f.operands.length === 1) return ddx(f.operands[0], binding, diff);
      else if (f.operands.length === 2) {
        const [arg1, arg2] = f.operands;
        if (operation === 'min') return threshold(arg1, arg2, ddx(arg2, binding, diff), ddx(arg1, binding, diff));
        if (operation === 'max') return threshold(arg1, arg2, ddx(arg1, binding, diff), ddx(arg2, binding, diff));
        assertUnreachable(operation);
        break;
      } else {
        if (operation === 'min') return ddx(min(f.operands[0], min(...f.operands.slice(1))), binding, diff);
        if (operation === 'max') return ddx(max(f.operands[0], max(...f.operands.slice(1))), binding, diff);
        assertUnreachable(operation);
        break;
      }
    }
    case 'threshold': {
      const [value, thr, pass, fail] = f.operands;
      if (!zero_deriv(value, binding, diff) || !zero_deriv(thr, binding, diff))
        throw new Error(`[${operation}] node must branch on constant inputs. ${f}`);
      return threshold(value, thr, ddx(pass, binding, diff), ddx(fail, binding, diff));
    }
    default:
      assertUnreachable(operation);
  }
}
