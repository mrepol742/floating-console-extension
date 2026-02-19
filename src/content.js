if (!window.__FLOATING_CONSOLE_LOADED__) {
  window.__FLOATING_CONSOLE_LOADED__ = true;

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("src/inject.js");
  (document.head || document.documentElement).appendChild(script);
  script.onload = () => script.remove();

  let unreadCount = 0;
  let logIndex = 0;

  window.addEventListener("DOMContentLoaded", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
    #floating-toggle-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #6200ee;
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        cursor: pointer;
        z-index: 99999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    #floating-console {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 400px;
        height: 300px;
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        overflow: hidden;
        z-index: 99999;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        font-family: "Roboto", sans-serif;
    }

    #floating-console.light-mode {
        background: #ffffff;
        color: #000;
        transition: all 0.2s ease;
    }

    #floating-console.dark-mode {
        background: #1e1e1e;
        color: #eee;
        transition: all 0.2s ease;
    }

    #floating-toggle-btn {
        position: fixed;
    }

    #floating-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        background: #ff3b3b;
        color: white;
        font-size: 11px;
        font-weight: 600;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.6);
        transition: all 0.2s ease;
        pointer-events: none;
    }

    #floating-badge.show {
        opacity: 1;
        transform: scale(1);
    }

    #console-header {
        background: #6200ee;
        color: white;
        padding: 10px;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    #console-header span {
        font-size: 15px;
    }

    #console-body {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
    }

    .log-error {
        background-color: rgba(255, 82, 82, 0.2);
        color: #ff5252 !important;
    }

    .log-warn {
        background-color: rgba(255, 193, 7, 0.2);
        color: #ffc107 !important;
    }

    .log-log,
    .log-info,
    .log-error,
    .log-warn {
        border: none;
        border-radius: 4px;
        padding: 5px;
        margin-bottom: 5px;
        color: inherit;
        display: flex;
        gap: 8px;
        align-items: flex-start;
        word-break: break-word;
        overflow-wrap: anywhere;
    }

    button {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
    }

    .log-line-number {
        min-width: 10px;
        opacity: 0.4;
        user-select: none;
    }

    .log-text {
        font-size: 12px;
    }

    .log-text {
        flex: 1;
        word-break: break-word;
        overflow-wrap: anywhere;
    }

    #console-search {
        display: flex;
        gap: 6px;
        padding: 8px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    #search-input {
        flex: 1;
        padding: 6px 8px;
        border-radius: 6px;
        border: 1px solid rgba(0,0,0,0.2);
        color: inherit;
        outline: none;
        background: transparent;
    }

    #search-btn {
        padding: 6px 10px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        background: #6200ee;
        color: white;
    }
  `;
    shadow.appendChild(style);

    const toggleBtn = document.createElement("div");
    toggleBtn.id = "floating-toggle-btn";
    toggleBtn.innerHTML = `<img src="${chrome.runtime.getURL("src/icons/terminal-solid-full.svg")}" alt="Console" width="16" height="16" />`;
    shadow.appendChild(toggleBtn);

    const badge = document.createElement("span");
    badge.id = "floating-badge";
    badge.textContent = "0";
    toggleBtn.appendChild(badge);

    const panel = document.createElement("div");
    panel.id = "floating-console";
    panel.classList.add("light-mode");
    panel.innerHTML = `
    <div id="console-header">
      <span>Floating Console</span>
      <div>
        <button id="clear-console">
          <img src="${chrome.runtime.getURL("src/icons/broom-solid-full.svg")}" alt="Clear" width="16" height="16" />
        </button>
        <button id="theme-toggle">
          <img src="${chrome.runtime.getURL("src/icons/affiliatetheme-brands-solid-full.svg")}" alt="Theme" width="16" height="16" />
        </button>
        <button id="close-console">
          <img src="${chrome.runtime.getURL("src/icons/xmark-solid-full.svg")}" alt="Close" width="16" height="16" />
        </button>
      </div>
    </div>

    <div id="console-search">
      <input type="text" id="search-input" placeholder="Search logs..." />
      <button id="search-btn">
        <img src="${chrome.runtime.getURL("src/icons/magnifying-glass-solid-full.svg")}" alt="Search" width="16" height="16" />
      </button>
    </div>

    <div id="console-body"></div>
  `;
    shadow.appendChild(panel);

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
      logIndex = 0;
    };

    const searchInput = panel.querySelector("#search-input");
    panel.querySelector("#theme-toggle").onclick = () => {
      panel.classList.toggle("dark-mode");
      panel.classList.toggle("light-mode");
      searchInput.classList.toggle("dark-mode");
      searchInput.classList.toggle("light-mode");
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
    toggleBtn.addEventListener("mousedown", function (e) {
      let offsetX = e.clientX - toggleBtn.offsetLeft;
      let offsetY = e.clientY - toggleBtn.offsetTop;

      function move(e) {
        toggleBtn.style.left = e.clientX - offsetX + "px";
        toggleBtn.style.top = e.clientY - offsetY + "px";
        toggleBtn.style.bottom = "auto";
        toggleBtn.style.right = "auto";
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

      if (panel.style.display === "none") {
        unreadCount++;
        badge.textContent = unreadCount;
        badge.classList.add("show");
      }

      if (isNearBottom) {
        body.scrollTo({
          top: body.scrollHeight,
          behavior: "smooth",
        });
      }
    }

    window.addEventListener("message", (event) => {
      if (event.data.source === "page-console") {
        appendMessage(event.data.type, event.data.args);
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (
        message.action === "toggleConsole" ||
        message.action === "toggle-float"
      ) {
        toggleBtn.style.display =
          toggleBtn.style.display === "none" ? "flex" : "none";
      }
      if (message.action === "toggle-console") {
        if (panel.style.display === "none") {
          panel.style.display = "flex";
          unreadCount = 0;
          badge.classList.remove("show");
        } else {
          panel.style.display = "none";
        }
      }
    });

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
  });
}
