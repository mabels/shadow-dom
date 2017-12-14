import * as cssToAst from '../../step-1/css-to-ast';
import * as RxMe from 'rxme';
import { Result, Rule, Declaration } from 'postcss';
import * as SelectorTree from '../../step-1/selector-tree';
import { assert } from 'chai';
import * as HtmlParser from '../../step-1/htmlparser2-strategie';
import { } from 'htmlparser2';

function selectors(): string[] {
  return [
    '.helloworld', '#helloworld', 'a', 'body', 'li < a',
    'strong, b', 'li:nth-child(even)', 'li:first-child',
    'li:not(:last-child)', 'a:before', 'a::after',
    'html, body', 'p', 'h1, h2, h3, h4, h5, h6',
    '#id .classname', '.classname .classname .classname',
    '#id.classname .classname#id',
    '*, *::after, *::before'
  ];
}

function html(): string {
  return `
    <html>
    <head>
      <title>test</title>
    </head>
    <body>
      <h1>Hello World</h1>
      <p>
        crazy World
      </p>
    </body>
  `;
}

function testCss(): string {
  return selectors().map((selector, idx) =>
    `${selector} {
        background: #${idx.toString(16)}${idx.toString(16)}${idx.toString(16)};
        font-face: "${selector}";
        font-size: ${('' + (1000000000 + ~~(Math.random() * 1000000000))).slice(1)};
     }`)
    .join('\n');
}

describe('css-to-ast', () => {

  it('readcss-from-string', async () => {
    return new Promise((rs, rj) => {
      cssToAst.fromString(testCss()).wildCard((_, rxMe) => {
        try {
          let idx = 0;
          const result = rxMe.data as Result;
          // console.log('-1', typeof(result));
          result.root.walkRules(node => {
            // console.log(node);
            assert.equal(node.selector, selectors()[idx], `${idx}:${selectors()[idx]}`);
            idx++;
          });
          assert.equal(idx, selectors().length);
          rs();
        } catch (e) {
          rj(e);
        }
        return true;
      }).passTo();
    });
  });

  it('buildSelectorTree', async () => {
    return new Promise((rs, rj) => {
      const astCss = cssToAst.fromString(testCss());
      let count = 0;
      let hs: SelectorTree.SelectorNode[] = [];
      SelectorTree.build(astCss).match((_, st) => {
        st.root.walk().match((__, sn) => {
          if (sn.selectorParts()[0][0].part.match(/^h[123456]$/) &&
            sn.selectorParts()[0][0].selectorType == SelectorTree.SelectorType.TAG) {
            hs.push(sn);
          }
          count++;
          return true;
        }).matchComplete((___, cn) => {
          try {
            const fs = hs.map(sn => sn.rule.nodes.find((n: any) => n.prop == 'font-size') as Declaration);
            assert.equal(hs.length, 6, 'hs length');
            assert.equal(hs.length, fs.filter(f => f.value == fs[0].value).length, 'fs.length');
            assert.equal(27, count);
            rs();
          } catch (e) {
            rj(e);
          }
          return true;
        }).passTo();
        return true;
      }).passTo();
    });
  });

  it('parsehtml', async () => {
    return new Promise((rs, rj) => {
      const rxIn = RxMe.Observable.create<string>(RxMe.Match.STRING, (obs) => {
        obs.next(RxMe.data(html()));
        obs.complete();
      });
      HtmlParser.parse(rxIn).matchComplete((_, ce) => {
        rs();
        return true;
      }).wildCard((_, rx) => {
        HtmlParser.walk(rx.data).wildCard((__, rxx) => {
          if (rxx.data.name) {
            console.log(rxx.data.type, rxx.data.name);
          }
          return true;
        }).passTo();
        return true;
      }).passTo();
    });
  });

});
