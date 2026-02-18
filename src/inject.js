(function () {
  const methods = ["log", "debug", "info", "warn", "error"];

  methods.forEach((method) => {
    const original = console[method];

    Object.defineProperty(console, method, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function (...args) {
        original.apply(this, args);

        const processedArgs = args.map((arg) => {
          if (arg instanceof Error)
            return `${arg.name}: ${arg.message}\n${arg.stack}`;
          return arg;
        });

        window.postMessage(
          {
            source: "page-console",
            type: method,
            args: processedArgs,
          },
          "*",
        );
      },
    });
  });
})();
