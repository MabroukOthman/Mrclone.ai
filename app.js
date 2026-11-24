(() => {
  const STORAGE_KEY = "mrclone.ai.prototype.v1";
  const $ = (id) => document.getElementById(id);
  let state = loadState();
  let activeId = state.assistants[0]?.id || null;

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
  function demoReply(assistant, question) {
    const context = assistant.notes.length
      ? "\n\nI can refer to these saved notes: " + assistant.notes.slice(0, 3).join(" · ").slice(0, 450)
      : "";
    const instruction = assistant.instructions
      ? "\nYour configured guidance is: " + assistant.instructions.slice(0, 260)
      : "";
    return "I'm " + assistant.name + ", your local demo assistant. You asked: “" + question + "”\n\nMy current personality is " + assistant.personality.toLowerCase() + ". This prototype demonstrates your assistant setup, but it is not connected to an AI model yet, so I can't generate a genuine AI answer." + context + instruction + "\n\nThe next development step is to connect a model through a secure backend.";
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
      p.textContent = "Your assistant's replies are simulated locally in this prototype.";
      welcome.append(orb, heading, p);
      messages.append(welcome);
      return;
    }
    assistant.messages.forEach((message) => addMessage(message.role, message.text));
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
  $("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const assistant = activeAssistant();
    const input = $("chat-input");
    const question = input.value.trim();
    if (!assistant || !question) return;
    assistant.messages.push({ role: "user", text: question });
    const reply = demoReply(assistant, question);
    assistant.messages.push({ role: "assistant", text: reply });
    input.value = "";
    persist();
    renderChat(assistant);
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
})();