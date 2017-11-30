import shadowDom from './src';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('should exist', () => {
    expect(shadowDom).toBeDefined();
});

it('has a shadowRoot property', () => {
  const {scope, cleanup} = setup();
  expect(scope.shadowRoot).toBeDefined();
  cleanup();
});

it('is native if supported', () => {
  const {scope, cleanup} = setup();
  if (HAS_SHADOWDOM) {
    expect(scope.shadowRoot.toString()).toBe('[object ShadowRoot]');
  }
  cleanup();
});

it('is plain element if unsupported', () => {
  const {scope, cleanup} = setup();
  if (!HAS_SHADOWDOM) {
    expect(scope.shadowRoot instanceof HTMLElement).toBeTruthy();
  }
  cleanup();
});

it('enforces basic scoping', () => {
  if (HAS_SHADOWDOM) {
    return;
  }

  const {scope, cleanup} = fixture('basic-scope');
  const b = scope.shadowRoot.querySelector('.b');
  const color = window.getComputedStyle(b).getPropertyValue('color');
  expect(color).toBe('rgb(0, 128, 0)');
  cleanup();
});

function fixture(name) {
  const html = require(`./fixtures/${name}.html`);
  return setup(html);
}

function setup(html) {
  const el = document.createElement('div');

  if (html) {
    el.innerHTML = html;
  }

  document.body.appendChild(el);

  const provided = el.querySelector('.shadow-dom');

  if (html && !provided) {
    throw new Error(`setup failed, html provided but no .shadow-dom element found`);
  }

  const shadowEl = html ? provided : el;
  const cleanup = () => document.body.removeChild(el);
  const innerHTML = shadowEl.innerHTML;

  const scope = shadowDom(el);
  scope.innerHTML = innerHTML;

  return {
    el,
    cleanup,
    scope
  };
}
