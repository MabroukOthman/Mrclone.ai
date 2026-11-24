(() => {
  const STORAGE_KEY = "mrclone.ai.prototype.v1";
  const $ = (id) => document.getElementById(id);
  let state = loadState();
  let activeId = state.assistants[0]?.id || null;
  let isSending = false;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && Array.isArray(parsed.assistants)) return parsed;
    } catch (_) {}
    return { assistants: [] };
  }
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function activeAssistant() {
    return state.assistants.find((item) => item.id === activeId) || null;
  }
  function makeId() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
  }
  function createAssistant() {
    const assistant = {
      id: makeId(), name: "My new assistant", description: "", personality: "Helpful and friendly",
      instructions: "", notes: [], messages: []
    };
    state.assistants.unshift(assistant);
    activeId = assistant.id;
    persist();
    render();
    $("assistant-name").focus();
    $("assistant-name").select();
  }
  function renderList() {
    const list = $("assistant-list");
    list.replaceChildren();
    state.assistants.forEach((assistant) => {
      const button = document.createElement("button");
      button.className = "assistant-item" + (assistant.id === activeId ? " active" : "");
      const icon = document.createElement("span");
      icon.className = "assistant-icon";
      icon.textContent = "✳";
      const name = document.createElement("span");
      name.textContent = assistant.name || "Untitled assistant";
      button.append(icon, name);
      button.addEventListener("click", () => { activeId = assistant.id; render(); });
      list.append(button);
    });
  }
  function renderNotes(assistant) {
    $("note-count").textContent = assistant.notes.length;
    const list = $("knowledge-list");
    list.replaceChildren();
    assistant.notes.forEach((note, index) => {
      const item = document.createElement("li");
      const content = document.createElement("span");
      content.textContent = note;
      const remove = document.createElement("button");
      remove.className = "remove-note";
      remove.type = "button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", "Remove knowledge note");
      remove.addEventListener("click", () => {
        assistant.notes.splice(index, 1);
        persist();
        renderNotes(assistant);
      });
      item.append(content, remove);
      list.append(item);
    });
  }
  function addMessage(role, text) {
    const messages = $("chat-messages");
    const welcome = messages.querySelector(".welcome-message");
    if (welcome) welcome.remove();
    const bubble = document.createElement("div");
    bubble.className = "message " + role;
    if (role === "assistant") {
      const label = document.createElement("span");
      label.className = "message-label";
      label.textContent = activeAssistant()?.name || "ASSISTANT";
      bubble.append(label);
    }
    bubble.append(document.createTextNode(text));
    messages.append(bubble);
    messages.scrollTop = messages.scrollHeight;
  }
  function renderChat(assistant) {
    const messages = $("chat-messages");
    messages.replaceChildren();
    if (!assistant.messages.length) {
      const welcome = document.createElement("div");
      welcome.className = "welcome-message";
      const orb = document.createElement("div");
      orb.className = "mini-orb";
      orb.textContent = "✳";
      const heading = document.createElement("h3");
      heading.textContent = "Start a conversation";
      const p = document.createElement("p");
      p.textContent = "Send a message to your assistant. AI replies require a configured server API key.";
      welcome.append(orb, heading, p);
      messages.append(welcome);
      return;
    }
    assistant.messages.forEach((message) => addMessage(message.role, message.text));
  }
  function setConnectionStatus(configured) {
    const pill = document.querySelector(".live-pill");
    if (!pill) return;
    pill.innerHTML = configured ? "<i></i> AI READY" : "<i></i> SETUP REQUIRED";
    pill.classList.toggle("configured", configured);
    pill.classList.toggle("not-configured", !configured);
  }
  async function checkHealth() {
    try {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("Health check failed");
      const data = await response.json();
      setConnectionStatus(Boolean(data.aiConfigured));
      const disclaimer = document.querySelector(".chat-disclaimer");
      if (disclaimer) disclaimer.textContent = data.aiConfigured
        ? "AI connected · Usage may be billed by your API provider"
        : "AI backend added · Add OPENAI_API_KEY to the server to enable live replies";
    } catch (_) {
      setConnectionStatus(false);
      const disclaimer = document.querySelector(".chat-disclaimer");
      if (disclaimer) disclaimer.textContent = "Start Mrclone.ai with npm start to use the secure AI backend";
    }
  }
  function render() {
    renderList();
    const assistant = activeAssistant();
    const empty = !assistant;
    $("empty-state").classList.toggle("hidden", !empty);
    $("workspace").classList.toggle("hidden", empty);
    $("export-assistant").disabled = empty;
    $("page-title").textContent = empty ? "Build your assistant" : assistant.name;
    if (empty) return;
    $("assistant-name").value = assistant.name;
    $("assistant-description").value = assistant.description;
    $("assistant-personality").value = assistant.personality;
    $("assistant-instructions").value = assistant.instructions;
    $("knowledge-input").value = "";
    renderNotes(assistant);
    renderChat(assistant);
  }

  $("new-assistant").addEventListener("click", createAssistant);
  $("empty-create").addEventListener("click", createAssistant);
  $("assistant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const assistant = activeAssistant();
    if (!assistant) return;
    assistant.name = $("assistant-name").value.trim() || "Untitled assistant";
    assistant.description = $("assistant-description").value.trim();
    assistant.personality = $("assistant-personality").value;
    assistant.instructions = $("assistant-instructions").value.trim();
    persist();
    render();
  });
  $("delete-assistant").addEventListener("click", () => {
    const assistant = activeAssistant();
    if (!assistant || !window.confirm("Delete " + assistant.name + " and its local chat history?")) return;
    state.assistants = state.assistants.filter((item) => item.id !== activeId);
    activeId = state.assistants[0]?.id || null;
    persist();
    render();
  });
  $("add-knowledge").addEventListener("click", () => {
    const assistant = activeAssistant();
    const note = $("knowledge-input").value.trim();
    if (!assistant || !note) return;
    assistant.notes.push(note);
    $("knowledge-input").value = "";
    persist();
    renderNotes(assistant);
  });
  $("chat-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const assistant = activeAssistant();
    const input = $("chat-input");
    const question = input.value.trim();
    if (!assistant || !question || isSending) return;

    assistant.messages.push({ role: "user", text: question });
    input.value = "";
    persist();
    renderChat(assistant);
    isSending = true;
    $("send-button").disabled = true;
    $("send-button").textContent = "…";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistant: {
            name: assistant.name,
            description: assistant.description,
            personality: assistant.personality,
            instructions: assistant.instructions,
            notes: assistant.notes
          },
          messages: assistant.messages.slice(-12)
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The AI request failed. Please try again.");
      assistant.messages.push({ role: "assistant", text: data.answer });
      persist();
      renderChat(assistant);
    } catch (error) {
      addMessage("assistant", "I couldn't get a response: " + error.message);
    } finally {
      isSending = false;
      $("send-button").disabled = false;
      $("send-button").textContent = "↑";
      input.focus();
    }
  });
  $("export-assistant").addEventListener("click", () => {
    const assistant = activeAssistant();
    if (!assistant) return;
    const blob = new Blob([JSON.stringify(assistant, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (assistant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "assistant") + ".json";
    link.click();
    URL.revokeObjectURL(url);
  });

  render();
  checkHealth();
})();