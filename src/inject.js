(function () {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalDebug = console.debug;
  const originalTrace = console.trace;

  console.log = function (...args) {
    originalLog.apply(console, args);
    window.postMessage({ source: "page-console", type: "log", args }, "*");
  };

  console.error = function (...args) {
    originalError.apply(console, args);

    const processedArgs = args.map((arg) => {
      if (arg instanceof Error)
        return `${arg.name}: ${arg.message}\n${arg.stack}`;
      return arg;
    });

    window.postMessage(
      { source: "page-console", type: "error", args: processedArgs },
      "*",
    );
  };

  console.warn = function (...args) {
    originalWarn.apply(console, args);
    window.postMessage({ source: "page-console", type: "warn", args }, "*");
  };

  console.info = function (...args) {
    originalInfo.apply(console, args);
    window.postMessage({ source: "page-console", type: "info", args }, "*");
  };

  // console.debug = function (...args) {
  //   originalDebug.apply(console, args);
  //   window.postMessage({ source: "page-console", type: "debug", args }, "*");
  // };

  // console.trace = function (...args) {
  //   originalTrace.apply(console, args);
  //   window.postMessage({ source: "page-console", type: "trace", args }, "*");
  // };
})();
