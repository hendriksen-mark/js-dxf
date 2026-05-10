module.exports = {
  once: function (target, eventName) {
    return new Promise((resolve, reject) => {
      function handler(...args) {
        cleanup();
        resolve(args.length === 1 ? args[0] : args);
      }

      function errorHandler(err) {
        cleanup();
        reject(err);
      }

      function cleanup() {
        if (target.removeEventListener) {
          target.removeEventListener(eventName, handler)
          target.removeEventListener(eventName, handler);
        }

        else if (target.removeListener) {
          target.removeListener(eventName, handler);
          target.removeListener('error', errorHandler);
        }

        else if (target.off) {
          target.off(eventName, handler);
          target.off('error', errorHandler);
        }
      }

      if (target.addEventListener) {
        target.addEventListener(eventName, handler, { once: true });
        target.addEventListener('error', errorHandler, { once: true });
      }

      else if (target.addListener) {
        target.addListener(eventName, handler);
        target.addListener('error', errorHandler);
      }

      else if (target.on) {
        target.on(eventName, handler);
        target.on('error', errorHandler);
      }
    });
  }
};
