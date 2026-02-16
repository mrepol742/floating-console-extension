if (!window.__FLOATING_CONSOLE_LOADED__) {
  window.__FLOATING_CONSOLE_LOADED__ = true;

  let unreadCount = 0;
  let logIndex = 0;

  const toggleBtn = document.createElement("div");
  toggleBtn.id = "floating-toggle-btn";
  toggleBtn.innerText = "🛠️";
  document.body.appendChild(toggleBtn);

  const badge = document.createElement("span");
  badge.id = "floating-badge";
  badge.textContent = "0";
  toggleBtn.appendChild(badge);

  const panel = document.createElement("div");
  panel.id = "floating-console";
  panel.classList.add("light-mode");
  panel.innerHTML = `
    <div id="console-header">
      Floating Console
      <div>
        <button id="clear-console">🧹</button>
        <button id="theme-toggle">🌙</button>
        <button id="close-console">✖</button>
      </div>
    </div>

    <div id="console-search">
      <input type="text" id="search-input" placeholder="Search logs..." />
      <button id="search-btn">🔍</button>
    </div>

    <div id="console-body"></div>
  `;
  document.body.appendChild(panel);

  panel.style.display = "none";

  const body = panel.querySelector("#console-body");

  toggleBtn.onclick = () => {
    const isOpening = panel.style.display === "none";
    panel.style.display = isOpening ? "flex" : "none";

    if (isOpening) {
      unreadCount = 0;
      badge.classList.remove("show");
    }
  };

  panel.querySelector("#close-console").onclick = () => {
    panel.style.display = "none";
  };

  panel.querySelector("#clear-console").onclick = () => {
    body.innerHTML = "";
  };

  panel.querySelector("#theme-toggle").onclick = () => {
    panel.classList.toggle("dark-mode");
    panel.classList.toggle("light-mode");
  };

  const header = panel.querySelector("#console-header");
  header.addEventListener("mousedown", function (e) {
    let offsetX = e.clientX - panel.offsetLeft;
    let offsetY = e.clientY - panel.offsetTop;

    function move(e) {
      panel.style.left = e.clientX - offsetX + "px";
      panel.style.top = e.clientY - offsetY + "px";
      panel.style.bottom = "auto";
      panel.style.right = "auto";
    }

    function stop() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  });

  function appendMessage(type, args) {
    const isNearBottom =
      body.scrollHeight - body.scrollTop - body.clientHeight < 20;

    logIndex++;

    const msg = document.createElement("div");
    msg.className = `log-${type}`;

    const lineNumber = document.createElement("span");
    lineNumber.className = "log-line-number";
    lineNumber.textContent = logIndex;

    const text = document.createElement("span");
    text.className = "log-text";
    text.textContent = args
      .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
      .join(" ");

    msg.appendChild(lineNumber);
    msg.appendChild(text);

    body.appendChild(msg);

    if (isNearBottom) {
      body.scrollTo({
        top: body.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("src/inject.js");
  (document.head || document.documentElement).appendChild(script);
  script.onload = () => script.remove();

  window.addEventListener("message", (event) => {
    if (event.data.source === "page-console") {
      appendMessage(event.data.type, event.data.args);
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleConsole") {
      toggleBtn.style.display =
        toggleBtn.style.display === "none" ? "flex" : "none";
    }
  });

  const searchInput = panel.querySelector("#search-input");
  const searchBtn = panel.querySelector("#search-btn");

  function filterLogs() {
    const query = searchInput.value.toLowerCase().trim();
    const logs = body.querySelectorAll("div");

    logs.forEach((log) => {
      if (!query) {
        log.style.display = "flex";
        return;
      }

      const text = log.textContent.toLowerCase();
      log.style.display = text.includes(query) ? "flex" : "none";
    });
  }

  searchBtn.addEventListener("click", filterLogs);
  searchInput.addEventListener("input", filterLogs);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") filterLogs();
  });
}
