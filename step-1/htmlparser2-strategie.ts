import * as htmlparser from 'htmlparser2';
// import DomHandler from 'domHandler';
import * as RxMe from 'rxme';
const DomHandler = require('domhandler');

export function parse(inp: RxMe.Subject<string>, out: RxMe.Subject<Node>): void {
  const dhandler = new DomHandler((_: any, dom: any) => {
    console.log(dom);
  });
  const parser = new htmlparser.Parser(dhandler);
  inp.matchComplete((_, complete) => {
    parser.end();
    return true;
  }).matchType<string>(RxMe.Match.STRING, (_, htmlfrag) => {
    parser.write(htmlfrag);
    return true;
  }).passTo(out);
  // const handler = new DomHandler();
}

// // var htmlparser = require("htmlparser2");
// var rawHtml = "Xyz <script language= javascript>var foo = '<<bar>>';< /  script><!--<!-- Waah! -- -->";
// var handler = new htmlparser.DomHandler(function (error, dom) {
//     if (error)
//     	[...do something for errors...]
//     else
//     	[...parsing done, do something...]
//         console.log(dom);
// });



// // const rawHtml = "Xyz <script language= javascript>var foo = '<<bar>>';< /  script><!--<!-- Waah! -- -->";
// var handler = new htmlparser.Parser(
//   (error, dom) {
//     if (error)
//         [...do something for errors...]
//     else
//         [...parsing done, do something...]
// });
// var parser = new htmlparser.Parser(handler);
// parser.parseComplete(rawHtml);
// sys.puts(sys.inspect(handler.dom, false, null));
