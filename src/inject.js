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

  /**
   * Capture uncaught errors and resource loading failures
   * This includes errors that may not be caught by the overridden console methods,
   * such as syntax errors or resource loading issues.
   */
  window.addEventListener(
    "error",
    (event) => {
      if (event.target?.src || event.target?.href) {
        console.error(
          "Resource failed:",
          event.target.src || event.target.href,
        );
      }
    },
    true,
  );

  /**
   * Capture Fetch and XHR failures
   */
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    try {
      return await originalFetch(...args);
    } catch (err) {
      console.error("Fetch failed:", url, err);
      throw err;
    }
  };

  /**
   * Capture XHR failures
   */
   const originalOpen = XMLHttpRequest.prototype.open;

   XMLHttpRequest.prototype.open = function (...args) {
     this.addEventListener("error", () => {
       console.error("XHR failed:", args[1]);
     });
     return originalOpen.apply(this, args);
   };
})();
