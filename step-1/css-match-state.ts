import { Selectors, RuleSelector } from './selectors';
import { Selector, Node } from 'postcss-selector-parser';

export class SelectorState {
  public pos: number;
  public readonly selectors: Node[];
  public readonly ruleSelector: RuleSelector;
  constructor(rus: RuleSelector) {
    this.pos = 0;
    this.ruleSelector = rus;
    this.selectors = rus.selector.nodes;
  }
}

export default class CssMatchState {
  public readonly selectors: SelectorState[];

  constructor(selectors: Selectors) {
    this.selectors = selectors.selectors.map(i => new SelectorState(i));
  }

  public match(node: any): void {
    this.selectors.filter(i => {
      // find tag
      let foundTag = false;
      if (dom.type == 'tag') {
        foundTag = !!i.selector.nodes.find(t => {
          // console.log(t);
          return t.type == 'tag' && t.value == dom.name;
        });
        if (foundTag) {
          console.log('FoundTag:', dom.type, dom.name);
        }
      }
      for (let attr in dom.attribs) {
        let value = [dom.attribs[attr]];
        if (attr == 'class') {
          value = value[0].split(/\s+/);
        }
        const found = !!i.selector.nodes.find(t => {
          return t.type == attr && value.indexOf(t.value) >= 0;
        });
        if (found) {
          console.log('FoundAttrib:', dom.type, dom.name, attr, value);
        }
      }
    });
  }

}
