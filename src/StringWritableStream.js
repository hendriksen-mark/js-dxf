const SUPPORTED_EVENTS = ['finish', 'error'];

class StringWritableStream {
  constructor() {
    this.writable = true;

    this._chunks = [];
    this._closed = false;
    this._eventTarget = new EventTarget();
  }

  addEventListener(event, callback) {
    if (SUPPORTED_EVENTS.includes(event)) {
      this._eventTarget.addEventListener(event, callback);
    } else {
      throw new Error(`Unsupported event: ${event}`);
    }
  }

  removeEventListener(event, callback) {
    if (SUPPORTED_EVENTS.includes(event)) {
      this._eventTarget.removeEventListener(event, callback);
    } else {
      throw new Error(`Unsupported event: ${event}`);
    }
  }

  write(chunk) {
    if (this._closed) {
      throw new Error('Stream is closed');
    }

    if (typeof chunk === 'string') {
      this._chunks.push(chunk);
    } else if (chunk instanceof Uint8Array) {
      this._chunks.push(new TextDecoder().decode(chunk));
    } else {
      throw new TypeError('Chunk must be a string or Uint8Array');
    }

    return true;
  }

  end() {
    this._closed = true;
    this.writable = false;

    process.nextTick(() =>
      this._eventTarget.dispatchEvent(new Event('finish'))
    );
  }

  toString() {
    if (!this._closed) {
      throw new Error('Stream is not closed yet');
    }
    return this._chunks.join('');
  }
}

module.exports = StringWritableStream;
module.exports.StringWritableStream = StringWritableStream;
