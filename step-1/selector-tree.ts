import * as RxMe from 'rxme';
import { Result, Rule } from 'postcss';
import { create } from 'domain';

export enum SelectorType {
  ID = 'id',
  CLASS = 'class',
  COLONS = 'colon',
  CHILD = 'child',
  PLUS = 'plus',
  ATTR = 'attr',
  TAG = 'tag'
}

export class SelectorPart {
  public readonly selectorType: SelectorType;
  public readonly part: string;

  public static from(part: string): SelectorPart {
    let st: SelectorType = null;
    let raw = part;
    if (part.startsWith('.') || part.startsWith('[class=')) {
      st = SelectorType.CLASS;
      raw = part.slice(1);
    } else if (part.startsWith('#') || part.startsWith('[id=')) {
      st = SelectorType.ID;
      raw = part.slice(1);
    } else if (part.startsWith('::')) {
      st = SelectorType.COLONS;
      raw = part.slice(2);
    } else if (part.startsWith(':')) {
      st = SelectorType.COLONS;
      raw = part.slice(1);
    } else if (part.startsWith('<')) {
      st = SelectorType.CHILD;
      raw = part.slice(1);
    } else if (part.startsWith('+')) {
      st = SelectorType.PLUS;
      raw = part.slice(1);
    } else if (part.startsWith('[')) {
      st = SelectorType.ATTR;
    } else {
      st = SelectorType.TAG;
    }
    return new SelectorPart(part, st);
  }
  private constructor(part: string, st: SelectorType) {
    this.part = part;
    this.selectorType = st;
  }

  public toString(): string {
    return `{${this.part}:${this.selectorType}}`;
  }

}

export class SelectorNode {
  public readonly objectId: string;
  public readonly parent: SelectorNode;
  public readonly parts: SelectorPart[];
  public readonly children: Map<string, SelectorNode[]>;
  public readonly rule: Rule;

  private static _walk(nodes: SelectorNode[], obs: RxMe.Observer<SelectorNode>): void {
    nodes.forEach(node => {
      if (node.rule) {
        obs.next(RxMe.data(node));
      }
      for (let sn of node.children.values()) {
        // console.log('_walk:for:', sn.partSelectorString());
        this._walk(sn, obs);
      }
    });
  }

  private static partsToString(parts: string[]): string {
    return parts.join('');
  }

  constructor(parent?: SelectorNode, selectors?: string[], rule?: Rule) {
    this.objectId = ('' + (1000000000 + ~~(Math.random() * 1000000000))).slice(1);
    this.parent = parent;
    this.parts = (selectors || []).map(s => SelectorPart.from(s));
    this.rule = rule;
    this.children = new Map<string, SelectorNode[]>();
  }

  public partSelectorString(): string {
    return SelectorNode.partsToString(this.parts.map(p => p.part));
  }

  public selectorParts(): SelectorPart[][] {
    if (!this.parent) {
      return [];
    }
    const tmp = [this.parts];
    return this.parent.selectorParts().concat(tmp);
  }

  public selector(): string[] {
    let tmp = [this.partSelectorString()];
    if (!this.parent) {
      return [];
    }
    return this.parent.selector().concat(tmp);
  }

  public add(parts: string[], rule: Rule): SelectorNode {
    const partsStr = SelectorNode.partsToString(parts);
    // console.log('add:', partsStr);
    let found = this.children.get(partsStr);
    if (!found) {
      found = [];
      this.children.set(partsStr, found);
    }
    const created = new SelectorNode(this, parts, rule);
    found.push(created);
    return created;
  }

  public walk(): RxMe.Observable<SelectorNode> {
    return RxMe.Observable.create(SelectorNode, (obs: RxMe.Observer<SelectorNode>) => {
      // console.log('walk-1'),
      SelectorNode._walk([this], obs);
      obs.complete();
    });
  }

}

export class SelectorTree {

  public readonly root: SelectorNode;

  constructor() {
    this.root = new SelectorNode();
  }

  private tokizeSelector(str: string): string[] {
    const splitable = str.replace(/(\:+)/g, ',$1').replace(/([\+\.\#\<])/g, ',$1').split(',');
    return splitable;
  }

  private selectorPerNode(str: string): string[] {
    const spn = str.replace(/\s*\<\s*/g, ' <').replace(/\s+/g, ' ');
    return spn.split(' ');
  }

  private ruleSetList(str: string): string[] {
    return str.split(/\s*,\s*/);
  }

  public add(rule: Rule): void {
    this.ruleSetList(rule.selector).forEach((selector, j, rarr) => {
      const lastRule = rarr.length == j + 1 || true;
      let level = this.root;
      this.selectorPerNode(selector).forEach((nodeSelector, i, sarr) => {
        // console.log('add:', rule.selector, selector, nodeSelector);
        const lastSelector = sarr.length == i + 1;
        level = level.add(this.tokizeSelector(nodeSelector), (lastSelector) ? rule : null);
      });
    });
  }
}

export function build(obsResult: RxMe.Observable<Result>): RxMe.Observable<SelectorTree> {
  return RxMe.Observable.create(SelectorTree, (obs: RxMe.Observer<SelectorTree>) => {
    obsResult.wildCard((_, cp) => {
      const result = cp.data as Result;
      const st = new SelectorTree();
      result.root.walkRules(node => {
        st.add(node);
      });
      obs.next(RxMe.data(st));
      obs.complete();
      return true;
    }).passTo(obs);
  });
}
