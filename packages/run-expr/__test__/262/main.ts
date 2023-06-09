/**
 * @file main.ts
 * @author afcfzf(9301462@qq.com)
 */

import { globSync } from 'glob';
import { resolve, parse } from 'path';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import { runInContext } from '../../src/index';

class Tester {
  private static targetPaths = resolve(__dirname, '../262/specs/es5/ch08/**/*.js');

  private static libsPath = resolve(__dirname, './lib/es5/**/*.js');

  private libCode = '';

  constructor() {
    this.loadTestLib();
    this.run();
  }

  private loadTestLib(): void {
    const paths = globSync(Tester.libsPath);
    paths.forEach((path) => {
      this.libCode += `/* path: ${path} */\n${readFileSync(path, { encoding: 'utf-8' })}`;
    });
  }

  private run(): void {
    const paths = globSync(Tester.targetPaths, { ignore: { ignored: path => {
      const ignore = path.fullpath().includes('.todo');
      return ignore;
    }}});

    const info = {
      all: paths.length,
      success: 0,
      fail: 0,
    };

    for (const path of paths) {
      const { name, dir, ext } = parse(path);
      const forld = dir.split(/\//).slice(-2)
        .join('/');
      const file = `${forld}/${name}${ext}`;
      const code = readFileSync(path, { encoding: 'utf-8' });
      try {
        this.evaluate(`${this.libCode}\n${code}`);
        console.log(chalk.green(`✅ PASS: ${file}`));
        info.success += 1;
      } catch (err) {
        info.fail += 1;
        console.log(chalk.red(`❌ FAIL: ${file} ----- err: ${err}`));
      }
    }

    console.log('=============');
    console.log(`【✅ Summary】-- pass ${info.success}/${info.all}; percent: ${(info.success / info.all * 100).toFixed(2)}%`);
    console.log(`【❌ Summary】-- fail ${info.fail}/${info.all}`);
  }

  private evaluate(code: string): void {
    runInContext(code , {
      Symbol,
      eval,
      Function,
      Error,
      Math,
      Number,
      SyntaxError,
      ReferenceError,
      Boolean,
      String,
      isNaN,
      Infinity,
    }).evaluate();
  }
}

new Tester();
