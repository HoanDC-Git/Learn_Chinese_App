const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const html = renderToStaticMarkup(createElement('div', { 'data-no-zoom': true }, 'test'));
console.log(html);
