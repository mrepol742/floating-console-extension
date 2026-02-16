if (!window.__FLOATING_CONSOLE_LOADED__) {
  window.__FLOATING_CONSOLE_LOADED__ = true;

  let unreadCount = 0;

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

    const msg = document.createElement("div");
    msg.className = `log-${type}`;
    msg.textContent = args
      .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
      .join(" ");
    body.appendChild(msg);

    if (panel.style.display === "none") {
      unreadCount++;
      badge.textContent = unreadCount;
      badge.classList.add("show");
    }

    if (isNearBottom)
      body.scrollTo({
        top: body.scrollHeight,
        behavior: "smooth",
      });
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
}
