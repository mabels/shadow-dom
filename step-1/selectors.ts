import * as RxMe from 'rxme';
import { Result, Rule } from 'postcss';
import { create } from 'domain';
import { Selector } from 'postcss-selector-parser';
import * as parser from 'postcss-selector-parser';

// export enum SelectorType {
//   TAG, // order of selector parts
//   ID,
//   CLASS,
//   ATTR,
//   CHILD,
//   PLUS,
//   COLONS
// }

// export enum AttributeMatchAction {
//   EQ = '=',
//   TILDE = '~',
//   EXCLAMATION = '!',
//   STARTSWITH = '^',
//   ENDSWITH = '$',
//   INCLUDES = '*'
// }

// export enum AttributeMatchModifier {
//   CASE = '_',
//   IGNORECASE = 'i'
// }

// const AttributeMatchRegex =
// /\[\s*"*\s*([^"=~!^$*\s]+)["\s]*([\~!^$*]*)=\s*"*\s*([^"\s]+)\s*("|"\s*(i)|\s+(i))*\s*\]/;

// export class SelectorPart {
//   public readonly selectorType: SelectorType;
//   public readonly key: string;
//   public readonly value: string;
//   public readonly action: AttributeMatchAction;
//   public readonly modifier: AttributeMatchModifier;
//   public readonly src: string;

//   public static parseAttribute(src: string, tosplit: string): SelectorPart {
//     const attr = AttributeMatchRegex.exec(tosplit);
//     // console.log(attr, splitted);
//     if (!attr) {
//       return;
//     }
//     let amm = AttributeMatchModifier.CASE;
//     if (attr[5] == 'i' || attr[6] == 'i') {
//       amm = AttributeMatchModifier.IGNORECASE;
//     }
//     let sType = SelectorType.ATTR;
//     if (attr[1] == 'id') {
//       sType = SelectorType.ID;
//     }
//     if (attr[1] == 'class') {
//       sType = SelectorType.CLASS;
//     }
//     const action = [
//       AttributeMatchAction.TILDE,
//       AttributeMatchAction.EXCLAMATION,
//       AttributeMatchAction.STARTSWITH,
//       AttributeMatchAction.ENDSWITH,
//       AttributeMatchAction.INCLUDES,
//     ].find(ama => attr[2] == ama) || AttributeMatchAction.EQ;
//     return new SelectorPart(src, sType, attr[1], attr[3], action, amm);
//   }

//   public static from(part: string): SelectorPart {
//     let st: SelectorType = null;
//     let raw = part;
//     /* attribute selector */
//     if (part.startsWith('.')) {
//       raw = `[class=${part.slice(1)}]`;
//     } else if (part.startsWith('#')) {
//       raw = `[id=${part.slice(1)}]`;
//     } else if (part.startsWith('::')) {
//       st = SelectorType.COLONS;
//       raw = part.slice(2);
//     } else if (part.startsWith(':')) {
//       st = SelectorType.COLONS;
//       raw = part.slice(1);
//     } else if (part.startsWith('<')) {
//       st = SelectorType.CHILD;
//       raw = part.slice(1);
//     } else if (part.startsWith('+')) {
//       st = SelectorType.PLUS;
//       raw = part.slice(1);
//     } else {
//       st = SelectorType.TAG;
//     }
//     const ret = SelectorPart.parseAttribute(part, raw);
//     if (!ret) {
//       return new SelectorPart(part, st, null, raw, AttributeMatchAction.EQ, AttributeMatchModifier.CASE);
//     }
//     return ret;
//   }
//   private constructor(src: string, selectorType: SelectorType, key: string,
//     value: string, action: AttributeMatchAction, modifier: AttributeMatchModifier) {
//     this.src = src;
//     this.selectorType = selectorType;
//     this.key = key;
//     this.value = value;
//     this.action = action;
//     this.modifier = modifier;
//   }

//   public toString(): string {
//     return JSON.stringify(this);
//   }

// }

// export class SelectorNode {
//   public readonly objectId: string;
//   // public readonly parent: SelectorNode;
//   public readonly parts: SelectorPart[];
//   public selector: Selector;
//   // public readonly children: Map<string, SelectorNode[]>;
//   // public readonly rule: Rule;

//   // private static _walk(nodes: SelectorNode[], obs: RxMe.Observer<SelectorNode>): void {
//   //   nodes.forEach(node => {
//   //     if (node.rule) {
//   //       obs.next(RxMe.data(node));
//   //     }
//   //     for (let sn of node.parts.values()) {
//   //       // console.log('_walk:for:', sn.partSelectorString());
//   //       this._walk(sn, obs);
//   //     }
//   //   });
//   // }

//   private static partsToString(parts: string[]): string {
//     return parts.join('');
//   }

//   private static tokizeSelector(str: string): string[] {
//     const splitable = str.replace(/(\:+)/g, ',$1')
//       .replace(/(\[[^\]]+\])/g, ',$1')
//       .replace(/(\+\.\#)/g, ',$1')
//       .replace(/^,/, '') // if not a tag
//       .split(',');
//     return splitable;
//   }

//   private static selectorPerNode(str: string): string[] {
//     const spn = str.replace(/\s*\<\s*/g, ' <').replace(/\s+/g, ' ');
//     return spn.split(' ');
//   }

//   public static factory(selector: string): SelectorNode[] {
//     const ret: SelectorNode[] = [];
//     SelectorNode.selectorPerNode(selector).forEach((nodeSelector, i, sarr) => {
//       // console.log('add:', rule.selector, selector, nodeSelector);
//       const lastSelector = sarr.length == i + 1;
//       const ts = SelectorNode.tokizeSelector(nodeSelector);
//       // console.log(nodeSelector, ts);
//       ret.push(new SelectorNode(ts));
//       // level = level.add(ts, (lastSelector) ? rule : null);
//     });
//     return ret;
//   }

//   constructor(selectors: string[]) {
//     this.objectId = ('' + (1000000000 + ~~(Math.random() * 1000000000))).slice(1);
//     // this.parent = parent;
//     this.parts = (selectors || []).map(s => SelectorPart.from(s))
//       .sort((a, b) => a.selectorType - b.selectorType);
//   }

//   public attachSelector(sel: Selector): void {
//     this.selector = sel;
//   }

//   public partSelectorString(): string {
//     return SelectorNode.partsToString(this.parts.map(p => p.value));
//   }

//   // public selectorParts(): SelectorPart[][] {
//   //   if (!this.parent) {
//   //     return [];
//   //   }
//   //   const tmp = [this.parts];
//   //   return this.parent.selectorParts().concat(tmp);
//   // }

//   // public selector(): string[] {
//   //   let tmp = [this.partSelectorString()];
//   //   if (!this.parent) {
//   //     return [];
//   //   }
//   //   return this.parent.selector().concat(tmp);
//   // }

//   // public add(parts: string[], rule: Rule): SelectorNode {
//   //   const sn = new SelectorNode(this, parts, rule);
//   //   const partsStr = sn.partSelectorString();
//   //   // console.log('add:', partsStr);
//   //   let found = this.children.get(partsStr);
//   //   if (!found) {
//   //     found = [];
//   //     this.children.set(partsStr, found);
//   //   }
//   //   const created = sn;
//   //   found.push(created);
//   //   return created;
//   // }

//   public walk(): RxMe.Observable<SelectorNode> {
//     return RxMe.Observable.create(SelectorNode, (obs: RxMe.Observer<SelectorNode>) => {
//       // console.log('walk-1'),
//       obs.next(RxMe.data(this));
//       obs.complete();
//     });
//   }

// }

// export class Selector {
//   public readonly nodes: SelectorNode[];
//   public readonly rule: Rule;

//   private static ruleSetList(str: string): string[] {
//     return str.split(/\s*,\s*/);
//   }

//   public static factory(cSelector: string, rule: Rule): Selector[] {
//     const ret: Selector[] = [];
//     Selector.ruleSetList(cSelector).forEach((selector, j, rarr) => {
//       ret.push(new Selector(rule, SelectorNode.factory(selector)));
//     });
//     return ret;
//   }

//   constructor(rule: Rule, nodes: SelectorNode[]) {
//     this.rule = rule;
//     this.nodes = nodes;
//     this.nodes.forEach(n => n.attachSelector(this));
//   }

// }

export interface RuleSelector {
  rule: Rule;
  selector: Selector;
}

export class Selectors {

  public readonly selectors: RuleSelector[];

  constructor() {
    this.selectors = [];
  }

  public add(rule: Rule): void {
    // const transform = selectors => {
    //   selectors.walk(selector => {
    //       // do something with the selector
    //       console.log(String(selector))
    //   });
    // };
    const ast = parser().astSync(rule.selector);
    // .then(ast =>
      this.selectors.push.apply(this.selectors,
         ast.nodes.map(i => ({rule: rule, selector: i})));
    // ).catch(e => console.error(e));
    // this.selectos.push.apply(this.selectors, Selector.factory(rule.selector, rule));
  }

  public walk(): RxMe.Observable<Selector> {
    return RxMe.Observable.create(null, (obs: RxMe.Observer<Selector>) => {
      this.selectors.forEach(st => {
        obs.next(RxMe.data(st));
      });
      obs.complete();
    });
  }

  public match(dom: any): void {
    
  }

}

export function build(obsResult: RxMe.Observable<Result>): RxMe.Observable<Selectors> {
  return RxMe.Observable.create(Selectors, (obs: RxMe.Observer<Selectors>) => {
    obsResult.wildCard((_, cp) => {
      const result = cp.data as Result;
      const st = new Selectors();
      result.root.walkRules(node => {
        st.add(node);
      });
      obs.next(RxMe.data(st));
      obs.complete();
      return true;
    }).passTo(obs);
  });
}
