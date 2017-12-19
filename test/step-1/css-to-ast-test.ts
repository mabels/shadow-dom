import * as cssToAst from '../../step-1/css-to-ast';
import rxme, * as RxMe from 'rxme';
import { Result, Rule, Declaration } from 'postcss';
import * as Selectors from '../../step-1/selectors';
import { assert } from 'chai';
import * as HtmlParser from '../../step-1/htmlparser2-strategie';
import { } from 'htmlparser2';
import { RuleSelector } from '../../step-1/selectors';
import { Selector, Tag } from 'postcss-selector-parser';
import CssMatchState from '../../step-1/css-match-state';
// import { Selector, SelectorType, AttributeMatchModifier, AttributeMatchAction } from '../../step-1/selectors';

function selectors(): string[] {
  return [
    '.helloworld', '#helloworld', 'a', 'body', 'li < a',
    'strong, b', 'li:nth-child(even)', 'li:first-child',
    'li:not(:last-child)', 'a:before', 'a::after',
    'html, body', 'p', 'h1, h2, h3, h4, h5, h6',
    '#id .classname', '.classname .classname .classname',
    '#id.classname .classname#id',
    '*, *::after, *::before',
    'div.mix1class#mix1id',
    'div#mix2id.mix2classname',
    '#mix3id.mix3classname',
    '.mix3classname#mix3id',
    '[id~=idAttr]', // language attribute
    '[id!=idAttr]', // language attribute
    '[id^=idAttr]', // beginnen
    '[id$=idAttr]', // enden
    '[id*=idAttr]', // includes
    '[id*=idAttr i]', // ignore case
    '[id=idAttr]',
    '[id="idAttr"]',
    '[class=classAttr]',
    '[class="classAttr"]'
  ];
}

function htmlCss(): string {
  return `
.cBody { font-face: "cbody"; }
body #iP { font-face: "body #iP"; }
#iP ul { font-face: "#iP ul"; }
ul li { font-face: "ul li"; }
  `;
}

function html(): string {
  return `
    <html>
    <head>
      <title>test</title>
    </head>
    <body class="cBody">
      <h1>Hello World</h1>
      <p id="iP">
        crazy World
        <ul>
          way crazy
          <li>
            total crazy
          </li>
        </ul>
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

  // describe.only('parse-selector', () => {
  //   it.only('div.mix1class#mix1id', () => {
  //     const sns = Selector.factory('div.mix1class#mix1id', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1, 'Nodes');
  //     const sn = sns[0].nodes[0];
  //     console.log(sn.parts);
  //     assert.equal(sn.parts.length, 3, 'parts');
  //     assert.equal(sn.parts[0].selectorType, SelectorType.TAG);
  //     assert.equal(sn.parts[0].value, 'div');
  //     assert.equal(sn.parts[1].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[1].value, 'mix1id');
  //     assert.equal(sn.parts[2].selectorType, SelectorType.CLASS);
  //     assert.equal(sn.parts[2].value, 'mix1class');
  //   });
  //   it('#mix1id.mix1class', () => {
  //     const sns = Selector.factory('#mix1id.mix1class', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 2);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'mix1id');
  //     assert.equal(sn.parts[1].selectorType, SelectorType.CLASS);
  //     assert.equal(sn.parts[1].value, 'mix1class');
  //   });
  //   it('.mix1class#mix1id', () => {
  //     const sns = Selector.factory('.mix1class#mix1id', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 2);
  //     assert.equal(sn.parts.length, 2);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'mix1id');
  //     assert.equal(sn.parts[1].selectorType, SelectorType.CLASS);
  //     assert.equal(sn.parts[1].value, 'mix1class');
  //   });
  //   it('div[class=mix1class][id=max1id]', () => {
  //     const sns = Selector.factory('div[class=mix1class][id=mix1id]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     console.log(sn.parts);
  //     assert.equal(sn.parts.length, 3);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.TAG);
  //     assert.equal(sn.parts[0].value, 'div');
  //     assert.equal(sn.parts[1].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[1].value, 'mix1id');
  //     assert.equal(sn.parts[2].selectorType, SelectorType.CLASS);
  //     assert.equal(sn.parts[2].value, 'mix1class');
  //   });
  //   it('[id=idAttr]', () => {
  //     const sns = Selector.factory('[id=idAttr]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.EQ);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.CASE);
  //   });
  //   it('[class=classAttr]', () => {
  //     const sns = Selector.factory('[class=classAttr]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.CLASS);
  //     assert.equal(sn.parts[0].value, 'classAttr');
  //     assert.equal(sn.parts[0].key, 'class');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.EQ);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.CASE);
  //   });

  //   it('#idAttr', () => {
  //     const sns = Selector.factory('#idAttr', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.EQ);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.CASE);
  //   });
  //   it('.classAttr', () => {
  //     const sns = Selector.factory('.classAttr', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.CLASS);
  //     assert.equal(sn.parts[0].value, 'classAttr');
  //     assert.equal(sn.parts[0].key, 'class');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.EQ);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.CASE);
  //   });

  //   it('[id~=idAttr]', () => {
  //     const sns = Selector.factory('[id~=idAttr]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.TILDE);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.CASE);
  //   });

  //   it('[id!=idAttr]', () => {
  //     const sns = Selector.factory('[id!=idAttr]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.EXCLAMATION);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.CASE);
  //   });

  //   it('[id^=idAttr]', () => {
  //     const sns = Selector.factory('[id^=idAttr]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.STARTSWITH);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.CASE);
  //   });

  //   it('[id$=idAttr]', () => {
  //     const sns = Selector.factory('[id$=idAttr]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.ENDSWITH);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.CASE);
  //   });

  //   it('[id*=idAttr]', () => {
  //     const sns = Selector.factory('[id*=idAttr]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.INCLUDES);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.CASE);
  //   });

  //   it('[id*=idAttr i]', () => {
  //     const sns = Selector.factory('[id*=idAttr i]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.INCLUDES);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.IGNORECASE);
  //   });

  //   it('["id"*="idAttr"i]', () => {
  //     const sns = Selector.factory('["id"*="idAttr"i]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.INCLUDES);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.IGNORECASE);
  //   });
  //   it('[id*="idAttr" i]', () => {
  //     const sns = Selector.factory('[id*="idAttr" i]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.INCLUDES);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.IGNORECASE);
  //   });

  //   it('[id*=idAttr i]', () => {
  //     const sns = Selector.factory('[id*=idAttr i]', null);
  //     assert.equal(sns.length, 1);
  //     assert.equal(sns[0].nodes.length, 1);
  //     const sn = sns[0].nodes[0];
  //     assert.equal(sn.parts.length, 1);
  //     assert.equal(sn.parts[0].selectorType, SelectorType.ID);
  //     assert.equal(sn.parts[0].value, 'idAttr');
  //     assert.equal(sn.parts[0].key, 'id');
  //     assert.equal(sn.parts[0].action, AttributeMatchAction.INCLUDES);
  //     assert.equal(sn.parts[0].modifier, AttributeMatchModifier.IGNORECASE);

  //   });
  // });

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

  it('buildSelectorCss', async () => {
    return new Promise((rs, rj) => {
      const astCss = cssToAst.fromString(testCss());
      let count = 0;
      const hs: Selectors.RuleSelector[] = [];
      // const mix: Selectors.SelectorPart[][] = [];
      Selectors.build(astCss).match((_, st) => {
        st.walk().wildCard((__, s: RxMe.RxMe) => {
          const rsor = s.data as RuleSelector;
          if (!rsor.selector) {
            return true;
          }
          // console.log(rsor.selector.nodes);
          const h = rsor.selector.nodes
            .filter(n => (n.type == 'tag' && n.value.match(/^h[123456]$/)));
          if (h.length) {
            hs.push(rsor);
          }
          // s.nodes.forEach(sn => {
          //   const mixing = sn.parts.filter(sns => sns.value.includes('mix'));
          //   if (mixing.length > 0) {
          //     mix.push.apply(mix, mixing);
          //   }
          // });
          count++;
          return true;
        }).matchComplete((___, cn) => {
          try {
            // console.log(hs);
            const fs = hs.map(sn => sn.rule.nodes.find((n: any) => n.prop == 'font-size') as Declaration);
            assert.equal(hs.length, 6, 'hs length');
            assert.equal(hs.length, fs.filter(f => f.value == fs[0].value).length, 'fs.length');
            assert.isTrue(selectors().length < count);
            // const refTypeOrder: any = {
            //   'tag': 1,
            //   'id': 2,
            //   'class': 3
            // };
            // console.log('WTF', mix);
            // mix.forEach(sp => {
            //   const typOrder = sp.map(p => p.selectorType);
            //   const sorted = [].concat(typOrder).sort((a, b) => refTypeOrder[a] - refTypeOrder[b]);
            //   assert.deepEqual(typOrder, sorted, JSON.stringify(sp));

            // });
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

  it('parsehtml', () => {
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

  it('buildStyledDom', () => {
    return new Promise((rs, rj) => {
      const rxIn = RxMe.Observable.create<string>(RxMe.Match.STRING, (obs) => {
        obs.next(RxMe.data(html()));
        obs.complete();
      });
      const astCss = cssToAst.fromString(htmlCss());
      // console.log(`fine`, astCss);
      Selectors.build(astCss).match((__, st) => {
        // console.log(`fine`, st);
        const cms = new CssMatchState(st);
        HtmlParser.parse(rxIn).matchComplete((_, ce) => {
          rs();
          return true;
        }).wildCard((_, rx) => {
          HtmlParser.walk(rx.data).wildCard((___, rxx) => {
            if (rxx.data.type == 'tag') {
              // console.log(rxx.data);
              cms.match(rxx.data);
            }
            return true;
          }).passTo();
          return true;
        }).passTo();
        return true;
      }).passTo();
      return true;
    });
  });
});
