import * as postcss from 'postcss';
import * as fs from 'fs';
import * as RxMe from 'rxme';

export function fromString(css: string): RxMe.Observable<postcss.Result> {
  return RxMe.Observable.create(null, (obs: RxMe.Observer<postcss.Result>) => {
    postcss().process(css).then(result => {
      obs.next(RxMe.data(result));
    }).catch((e: any) => obs.error(e));
  });
}

export function from(fname: string): RxMe.Observable<postcss.Result> {
  return RxMe.Observable.create(null, (obs: RxMe.Observer<postcss.Result>) => {
    fs.readFile(fname, (err, css) => {
      if (err) {
        obs.error(err);
        return;
      }
      fromString(css.toString()).passTo(obs);
    });
  });
}
