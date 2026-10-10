const { once } = require('../src/once');
const { Writable } = require('node:stream');

describe('once', () => {
  it('resolves on "drain" event for a DOM eventTarget', async () => {
    const target = new EventTarget();

    const drainPromise = once(target, 'drain');

    setTimeout(() => {
      const event = new Event('drain');
      target.dispatchEvent(event);
    }, 10);

    expect((await drainPromise)).toBeDefined();
  });

  it('resolves when writable stream emits "drain"', async () => {
    const writable = new Writable({
      write(chunk, encoding, callback) {
        const emit = this.emit.bind(this);
        setTimeout(() => {
          emit('drain');
          callback();
        }, 100);
      }
    });

    const drainPromise = once(writable, 'drain');

    writable.write('data')

    expect((await drainPromise)).toBeDefined();
  });
});
