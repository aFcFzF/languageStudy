/**
 * @file Scope.ts
 * @author afcfzf(9301462@qq.com)
 */

import { ValueDetail, ValueDetailKind } from './ValueDetail';
import { hasOwnProperty } from '../utils';
import { ScopeValueNotExist } from '../types';
import { SCOPE_VALUE_NOT_EXIST } from '../const';

export type ScopeValue = Record<string, unknown>;
export type ScopeDetail = Record<string, ValueDetail>;

export const DEFAULT_INTERNAL_FULL_SCOPE_DATA: ScopeValue = {
  console,
  undefined,
  ReferenceError,
  Array,
  Date,
  RegExp,
  Object,
};

export enum ScopeType {
  FUNCTION = 'function',
  BLOCK = 'block',
}

export interface ScopeSearchResult {
  scope: Scope;
  name: string;
  value: any | ScopeValueNotExist;
}


export class Scope {
  public type: ScopeType;

  /**
   * 父作用域
   */
  public parent: Scope | null;

  /**
   * 当前作用域
   * 必须存引用，场景: this === window;
   */
  private scopeValue: ScopeValue;

  private scopeDetail: ScopeDetail = {};

  constructor(type: ScopeType, parent: Scope | null = null, scopeValue: ScopeValue = {}) {
    this.type = type;
    this.parent = parent;
    this.scopeValue = scopeValue;

    Object.entries(scopeValue).forEach(([key, value]) => {
      this.scopeDetail[key] = new ValueDetail({
        kind: ValueDetailKind.VAR,
        value,
        name: key,
        scope: this,
      });
    });
  }

  public getScopeValue(): ScopeValue {
    return this.scopeValue;
  }

  /**
   * 这里setValue是给当前scope赋值；
   * 原因：不清楚是给block/function/root作用域赋值，调用该方法时, 只给current赋值；其他作用域需要自行判断
   * @param val
   */
  public setValue(name: string, value: unknown): void {
    const valueDetail = this.scopeDetail[name];
    if (valueDetail == null) {
      throw new Error(`value detail not exist, name is ${name}`);
    }

    this.scopeValue[name] = value;
  }

  public deleteScopeValue(name: string): void {
    const { scope } = this.search(name);
    delete scope.scopeValue[name];
    delete scope.scopeDetail[name];
  }

  public getScopeDetail(): ScopeDetail {
    return this.scopeDetail;
  }

  /**
   * 先从自身scope找，然后从作用域链找，最后从global找
   * @param rawName
   * @returns
   */
  public search(rawName: string): ScopeSearchResult {
    const resultCommon: Pick<ScopeSearchResult, 'name' | 'scope'> = {
      name: rawName,
      scope: this,
    };

    if (hasOwnProperty(this.scopeValue, rawName)) {
      return {
        ...resultCommon,
        value: this.scopeValue[rawName],
      };
    }

    if (this.parent) {
      return this.parent.search(rawName);
    }

    return {
      ...resultCommon,
      value: SCOPE_VALUE_NOT_EXIST,
    };
  }

  /**
   * 直接读取变量时，不存在就创建
   * @param rawName
   * @returns
   */
  public getRootScope(): Scope {
    if (this.parent) {
      return this.parent.getRootScope();
    }

    return this;
  }

  public declare(kind: ValueDetailKind, rawName: string, value: any): void {
    if (this.checkDefinition(kind, rawName)) {
      console.error(`Uncaught SyntaxError: Identifier '${rawName}' has already been declared`);
      return;
    }

    switch (kind) {
      case ValueDetailKind.VAR:
        this.defineVar(rawName, value);
        break;
      case ValueDetailKind.LET:
        this.defineLet(rawName, value);
        break;
      case ValueDetailKind.CONST:
        this.defineConst(rawName, value);
        break;
      default :
        throw new Error('define error');
    }
  }

  private checkDefinition(kind: ValueDetailKind, rawName: string): boolean {
    return [ValueDetailKind.CONST, ValueDetailKind.LET].includes(kind) && hasOwnProperty(this.scopeValue, rawName);
  }

  /**
   * ctx.fn = () => 1
   * 那么 function fn() { return 2 } 应该覆盖ctx
   * @param rawName
   * @param value
   */
  private defineVar(rawName: string, value: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let scope: Scope = this;
    while (scope.parent && scope.type !== ScopeType.FUNCTION) {
      scope = scope.parent;
    }

    this.scopeValue[rawName] = value;
    this.scopeDetail[rawName] = new ValueDetail({
      kind: ValueDetailKind.VAR,
      name: rawName,
      value,
      scope,
    });
  }

  private defineLet(rawName: string, value: any): void {
    this.scopeValue[rawName] = value;
    this.scopeDetail[rawName] = new ValueDetail({
      kind: ValueDetailKind.LET,
      name: rawName,
      value,
      scope: this,
    });
  }

  private defineConst(rawName: string, value: any): void {
    this.scopeValue[rawName] = value;
    this.scopeDetail[rawName] = new ValueDetail({
      kind: ValueDetailKind.CONST,
      name: rawName,
      value,
      scope: this,
    });
  }
}
