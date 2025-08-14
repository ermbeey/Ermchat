/* =========================
   ermchat — client-only demo
   Storage: localStorage + IndexedDB
   ========================= */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

const state = {
  user: null,      // {username, displayName}
  users: {},       // username -> full user object
  selected: {
    snippetId: null,
    fileId: null,
    contact: null,
    conversationWith: null,
  },
  db: null,        // IndexedDB handle
};

const DB_NAME = "ermchat_files_v1";
const DB_STORE = "files";

/* ---------- Utilities ---------- */
const nowIso = () => new Date().toISOString();
const fmtTime = iso => new Date(iso).toLocaleString();
const uid = (p = "") => p + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

async function sha256(text) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function toast(msg) {
  console.log("[ermchat]", msg);
}

/* ---------- LocalStorage schema ----------

users: {
  [username]: {
    username, displayName, passHash,
    contacts: [username, ...],
    snippets: [{id,title,lang,code,createdAt,updatedAt}],
    files: [{id,name,size,type,createdAt}], // blob in IndexedDB
    messages: [
      {id, from, to, text, createdAt, attachments:[{kind:'file'|'snippet', id}]}
    ]
  }
}

currentUser: "username"

----------------------------------------- */

function loadUsers() {
  try {
    state.users = JSON.parse(localStorage.getItem("ermchat_users") || "{}");
  } catch {
    state.users = {};
  }
}
function saveUsers() {
  localStorage.setItem("ermchat_users", JSON.stringify(state.users));
}
function setCurrentUser(username) {
  if (username) localStorage.setItem("ermchat_currentUser", username);
  else localStorage.removeItem("ermchat_currentUser");
}
function getCurrentUser() {
  return localStorage.getItem("ermchat_currentUser");
}
function ensureUser(username) {
  if (!state.users[username]) {
    state.users[username] = {
      username,
      displayName: username,
      passHash: "",
      contacts: [],
      snippets: [],
      files: [],
      messages: [],
    };
  }
}

/* ---------- IndexedDB for file blobs ---------- */

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}
async function putBlob(record) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(record);
    tx.oncomplete = () => resolve(true);
    tx.onerror = e => reject(e.target.error);
  });
}
async function getBlob(id) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e.target.error);
  });
}
async function deleteBlob(id) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = e => reject(e.target.error);
  });
}

/* ---------- Auth ---------- */

async function signup({ username, displayName, password }) {
  loadUsers();
  username = username.trim().toLowerCase();
  if (state.users[username]) throw new Error("Username already exists.");
  const passHash = await sha256(password);
  state.users[username] = {
    username,
    displayName: displayName.trim(),
    passHash,
    contacts: [],
    snippets: [],
    files: [],
    messages: [],
  };
  saveUsers();
  setCurrentUser(username);
  return login({ username, password });
}

async function login({ username, password }) {
  loadUsers();
  username = username.trim().toLowerCase();
  const user = state.users[username];
  if (!user) throw new Error("User not found.");
  const passHash = await sha256(password);
  if (user.passHash !== passHash) throw new Error("Invalid password.");
  state.user = { username, displayName: user.displayName };
  setCurrentUser(username);
  return state.user;
}

function logout() {
  state.user = null;
  setCurrentUser(null);
}

/* ---------- UI Boot ---------- */

async function boot() {
  // DB
  state.db = await openDB();
  loadUsers();

  // Auth resume
  const u = getCurrentUser();
  if (u && state.users[u]) {
    state.user = { username: u, displayName: state.users[u].displayName };
    showApp();
  } else {
    showAuth();
  }

  // Tabs (auth)
  $$(".tab").forEach(btn => btn.addEventListener("click", () => {
    $$(".tab").forEach(x => x.classList.remove("active"));
    $$(".tabpanel").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const id = btn.dataset.tab;
    $("#" + id).classList.add("active");
  }));

  // Auth forms
  $("#signupForm").addEventListener("submit", async e => {
    e.preventDefault();
    const displayName = $("#signupDisplayName").value;
    const username = $("#signupUsername").value;
    const password = $("#signupPassword").value;
    try {
      await signup({ displayName, username, password });
      showApp();
      $("#signupForm").reset();
    } catch (err) { alert(err.message); }
  });

  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const username = $("#loginUsername").value;
    const password = $("#loginPassword").value;
    try {
      await login({ username, password });
      showApp();
      $("#loginForm").reset();
    } catch (err) { alert(err.message); }
  });

  $("#logoutBtn").addEventListener("click", () => {
    logout();
    showAuth();
  });

  // Nav/view switching
  $$("#nav .nav-btn[data-view]").forEach(btn => {
    btn.addEventListener("click", () => gotoView(btn.dataset.view));
  });
  $$("[data-goto]").forEach(btn => {
    btn.addEventListener("click", () => gotoView(btn.dataset.goto));
  });

  // Snippets
  $("#newSnippetBtn").addEventListener("click", () => {
    state.selected.snippetId = null;
    $("#snippetForm").reset();
    $("#snippetId").value = "";
    $("#snippetTitle").focus();
  });
  $("#saveSnippetBtn").addEventListener("click", e => { e.preventDefault(); saveSnippet(); });
  $("#deleteSnippetBtn").addEventListener("click", deleteSnippet);
  $("#copySnippetBtn").addEventListener("click", () => {
    navigator.clipboard.writeText($("#snippetCode").value);
    toast("Snippet copied");
  });
  $("#downloadSnippetBtn").addEventListener("click", downloadSnippet);
  $("#shareSnippetBtn").addEventListener("click", shareSnippetToContact);
  $("#snippetSearch").addEventListener("input", renderSnippetList);

  // Files
  $("#fileInput").addEventListener("change", ev => handleFiles(ev.target.files));
  const drop = $("#dropZone");
  ["dragenter","dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("drag"); }));
  ["dragleave","drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("drag"); }));
  drop.addEventListener("drop", e => handleFiles(e.dataTransfer.files));

  $("#downloadFileBtn").addEventListener("click", downloadSelectedFile);
  $("#deleteFileBtn").addEventListener("click", deleteSelectedFile);
  $("#shareFileBtn").addEventListener("click", shareFileToContact);
  $("#exportAllBtn").addEventListener("click", exportAllData);
  $("#importAllInput").addEventListener("change", importAllData);

  // Contacts
  $("#addContactForm").addEventListener("submit", e => { e.preventDefault(); addContact(); });
  $("#removeContactBtn").addEventListener("click", removeSelectedContact);
  $("#openChatFromContactsBtn").addEventListener("click", () => {
    if (!state.selected.contact) return alert("Select a contact first.");
    openConversation(state.selected.contact);
    gotoView("chat");
  });

  // Chat
  $("#messageForm").addEventListener("submit", e => { e.preventDefault(); sendMessage(); });
  $("#attachFileInput").addEventListener("change", e => attachFileFromPicker(e.target.files[0]));
  $("#attachSnippetSelect").addEventListener("focus", refreshAttachSnippetOptions);
  $("#attachSnippetSelect").addEventListener("change", attachSnippetFromSelect);

  // Settings
  $("#profileForm").addEventListener("submit", async e => {
    e.preventDefault();
    await saveProfile();
  });
  $("#deleteAccountBtn").addEventListener("click", deleteAccount);
  $("#exportUserBtn").addEventListener("click", exportMyData);
  $("#importUserInput").addEventListener("change", importMyData);

  $("#year").textContent = new Date().getFullYear();
}

function showAuth() {
  $("#authGate").classList.remove("hidden");
  $("#app").classList.add("hidden");
}
function showApp() {
  $("#authGate").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#userDisplayName").textContent = state.user.displayName;
  $("#userUsername").textContent = state.user.username;
  gotoView("dashboard");
}

/* ---------- Views ---------- */

function gotoView(view) {
  $$(".view").forEach(v => v.classList.add("hidden"));
  $("#view-" + view).classList.remove("hidden");
  // Update stats & lists
  if (view === "dashboard") renderDashboard();
  if (view === "snippets") { renderSnippetList(); refreshAttachSnippetOptions(); }
  if (view === "files") renderFileList();
  if (view === "contacts") renderContactList();
  if (view === "chat") { renderConversationList(); renderMessages(); }
}

/* ---------- Data accessors for current user ---------- */

function udata() { return state.users[state.user.username]; }
function saveU() { saveUsers(); renderDashboardQuickStats(); }

/* ---------- Dashboard ---------- */

function renderDashboard() {
  renderDashboardQuickStats();
  // recent snippets
  const rs = [...udata().snippets].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5);
  $("#recentSnippets").innerHTML = rs.map(s =>
    `<li><strong>${escapeHtml(s.title)}</strong><div class="meta">${s.lang} • updated ${fmtTime(s.updatedAt)}</div></li>`
  ).join("") || `<li class="muted">No snippets yet.</li>`;
  // recent files
  const rf = [...udata().files].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,5);
  $("#recentFiles").innerHTML = rf.map(f =>
    `<li><strong>${escapeHtml(f.name)}</strong><div class="meta
