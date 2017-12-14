import * as htmlparser from 'htmlparser2';
// import DomHandler from 'domHandler';
import * as RxMe from 'rxme';
const DomHandler = require('domhandler'); // not nice but working

function _walk(dom: any, obs: RxMe.Observer<any>): void {
  dom.forEach((element: any) => {
    obs.next(RxMe.data(element));
    if (element.children) {
      _walk(element.children, obs);
    }
  });
}

export function walk(dom: any): RxMe.Observable<any> {
  return RxMe.Observable.create<any>(null, (obs) => {
    _walk(dom, obs);
    obs.complete();
  });
}

export function parse(inp: RxMe.Observable<string>): RxMe.Observable<any> {
  return RxMe.Observable.create<any>(null, (obs) => {
    let completeSubject: RxMe.Subject<any>;
    const dhandler = new DomHandler((_: any, dom: any) => {
      completeSubject.next(RxMe.data(dom));
      completeSubject.next(RxMe.complete());
      completeSubject.complete();
    });

    const parser = new htmlparser.Parser(dhandler);
    inp.matchComplete((subj, complete) => {
      completeSubject = subj;
      parser.end();
      return subj;
    }).matchType<string>(RxMe.Match.STRING, (_, htmlfrag) => {
      parser.write(htmlfrag);
      return true;
    }).passTo(obs);
  });
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
