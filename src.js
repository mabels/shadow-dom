import shortid from 'shortid';
import { setTimeout } from 'core-js/library/web/timers';

const SUPPORTS_SHADOW_DOM = ('attachShadow' in HTMLElement.prototype);

export default shadowDom;

function shadowDom(el) {
  // Paydirt, nothing to do
  if (SUPPORTS_SHADOW_DOM) {
    el.attachShadow({mode: 'open'});
    return el;
  }

  const id = shortid.generate();
  const shadowRoot = interrupt(document.createElement('div'));
  el.innerHTML = '';

  shadowRoot.id = id;
  shadowRoot.innerHTML = '';

  el.appendChild(shadowRoot);

  return {
    get shadowRoot() {
      return shadowRoot;
    }
  };
}

function getAll() {
  return Array.prototype.slice.call(window.getComputedStyle(document.body), 0);
}

function interrupt(el) {
  const id = shortid();
  const all = supports('all');
  const initial = supports('initial');

  const props = (all && initial) ? ['all'] : getAll();

  const style = document.createElement('style');
  style.setAttribute('data-id', id);

  style.textContent = `
    .${id} {
      ${props.map(prop => `${prop}: initial`).join(';')}
    }
  `;

  el.classList.add(id);
  document.head.appendChild(style);
  return el;
}

function supports(feature) {
  // Use CSS.supports if available
  if ('CSS' in window && 'supports' in CSS) {
    switch (feature) {
      case 'all':
        return CSS.supports('all', 'initial');
      case 'initial':
        return CSS.supports('font-size', 'initial');
      default:
        throw new TypeError(`supports: unknown feature "${feature}".`);
    }
  }

  switch(feature) {
    case 'all': {
      const el = document.createElement('div');
      return 'all' in el.style;
    }
    case 'initial': {
      const frame = document.createElement('iframe');
      document.body.appendChild(frame);

      const doc = frame.contentDocument;
      const win = frame.contentWindow;

      const el = doc.createElement('div');
      doc.body.appendChild(el);

      const before = win.getComputedStyle(el).getPropertyValue('color');

      doc.body.style.color = 'rgb(255, 0, 0)';
      const inter = win.getComputedStyle(el).getPropertyValue('color');

      el.style.color = 'initial';
      const after = win.getComputedStyle(el).getPropertyValue('color');

      const supported = before !== inter && after !== inter && before === after;
      document.body.removeChild(frame);
      return supported;
    }
    default:
      throw new TypeError(`supports: unknown feature "${feature}".`);
  }
}
