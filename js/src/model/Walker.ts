/**
 * @file Interpreter.ts
 * @author afcfzf(9301462@qq.com)
 */

import * as ESTree from 'estree';
import { ES5NodeType, ES5NodeVisitor, ES5VisitorMap } from '../standard/es5';
import { Scope } from './Scope';

interface WalkOption<T extends ESTree.Node> {
  node: T;
  scope: Scope;
  rootScope: Scope;
  visitorMap: ES5VisitorMap;
  globalThis: unknown;
}

export class Walker<T extends ESTree.Node> {
  public visitorMap: ES5VisitorMap;

  public scope: Scope;

  public rootScope: Scope;

  public globalThis: unknown;

  public node: T;

  constructor(option: WalkOption<T>) {
    const {
      node,
      scope,
      globalThis,
      visitorMap,
      rootScope,
    } = option;

    this.node = node;
    this.scope = scope;
    this.rootScope = rootScope;
    this.globalThis = globalThis;
    this.visitorMap = visitorMap;
  }

  public walk(esNode: ESTree.Node, scope?: Scope): any {
    const instance = new Walker({
      node: esNode,
      scope: scope || this.scope,
      visitorMap: this.visitorMap,
      rootScope: this.rootScope,
      globalThis: this.globalThis,
    });

    if (instance.node.type in this.visitorMap) {
      const visitor: ES5NodeVisitor = this.visitorMap[instance.node.type as ES5NodeType];
      return visitor(instance as any);
    }

    throw `${instance.node.type} not supported!`;
  }

  public evaluate(): any {
    return this.walk(this.node);
  }
}
