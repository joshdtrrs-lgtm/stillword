const STORAGE_KEY = "stillword.entries.v1";
const PROFILE_KEY = "stillword.profile.v1";
const THEME_KEY = "stillword.theme.v1";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const typeLabels = {
  prayer: "Personal prayer",
  reflection: "Reflection",
  gratitude: "Gratitude",
  request: "Prayer request",
  answered: "Answered prayer"
};

const verses = [
  { text: "“Trust in the LORD with all thine heart; and lean not unto thine own understanding.”", reference: "PROVERBS 3:5 · KJV" },
  { text: "“Be still, and know that I am God.”", reference: "PSALM 46:10 · KJV" },
  { text: "“The LORD is my shepherd; I shall not want.”", reference: "PSALM 23:1 · KJV" },
  { text: "“Casting all your care upon him; for he careth for you.”", reference: "1 PETER 5:7 · KJV" },
  { text: "“Pray without ceasing.”", reference: "1 THESSALONIANS 5:17 · KJV" },
  { text: "“The LORD is nigh unto all them that call upon him, to all that call upon him in truth.”", reference: "PSALM 145:18 · KJV" },
  { text: "“I can do all things through Christ which strengtheneth me.”", reference: "PHILIPPIANS 4:13 · KJV" },
  { text: "“Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.”", reference: "HEBREWS 4:16 · KJV" }
];

let entries = loadEntries();
let profile = loadProfile();
let activeView = "overview";
let verseIndex = Math.floor(new Date().getDate() % verses.length);
let toastTimer;

function loadEntries() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(item => item && item.id && item.title) : [];
  } catch {
    return [];
  }
}

function loadProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    return { name: typeof parsed.name === "string" ? parsed.name : "" };
  } catch {
    return { name: "" };
  }
}

function saveEntries() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    showToast("Couldn't save this entry. Your browser storage may be full or disabled.");
    return false;
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function formatDate(dateString) {
  if (!dateString) return "No date";
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function renderVerse() {
  const verse = verses[verseIndex];
  $("#dailyVerse").textContent = verse.text;
  $("#verseReference").textContent = verse.reference;
}

function updateGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  $("#greeting").textContent = profile.name ? `${greeting}, ${profile.name}.` : "Make room for what matters.";
  $("#avatar, .avatar").forEach?.(() => {});
  $(".avatar").textContent = profile.name ? profile.name.trim().charAt(0).toUpperCase() : "J";
  $("#displayName").value = profile.name;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const focusTarget = modal.querySelector("input:not([type=hidden]), textarea, select, button");
  if (focusTarget) setTimeout(() => focusTarget.focus(), 50);
}

function closeModals() {
  $$(".modal-backdrop.open").forEach(modal => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
  document.body.style.overflow = "";
}

function openEntryModal(entry = null, defaultType = "prayer") {
  $("#entryForm").reset();
  $("#entryId").value = entry ? entry.id : "";
  $("#entryTitle").value = entry ? entry.title : "";
  $("#entryType").value = entry ? entry.type : defaultType;
  $("#entryDate").value = entry ? entry.date : todayISO();
  $("#entryContent").value = entry ? entry.content : "";
  $("#entryVerse").value = entry ? (entry.verse || "") : "";
  $("#modalTitle").textContent = entry ? "Edit journal entry" : "New journal entry";
  $("#modalEyebrow").textContent = entry ? "MAKE A CHANGE" : "MAKE SOME SPACE";
  openModal("entryModal");
}

function makeEntryCard(entry) {
  const isRequest = entry.type === "request" && !entry.answered;
  const label = entry.answered ? typeLabels.answered : (typeLabels[entry.type] || "Journal entry");
  const displayType = entry.answered ? "answered" : entry.type;
  const excerpt = entry.content.length > 155 ? `${entry.content.slice(0, 155)}…` : entry.content;
  return `
    <article class="entry-card">
      <div class="entry-card-top">
        <span class="entry-tag">${escapeHTML(label)}</span>
        <time class="entry-date" datetime="${escapeHTML(entry.date)}">${escapeHTML(formatDate(entry.date))}</time>
      </div>
      <h3>${escapeHTML(entry.title)}</h3>
      <p class="entry-excerpt">${escapeHTML(excerpt)}</p>
      ${entry.verse ? `<div class="entry-verse">↳ ${escapeHTML(entry.verse)}</div>` : ""}
      <div class="entry-card-bottom">
        <span class="entry-date">${entry.answered ? "Marked as answered" : "Personal entry"}</span>
        <div class="entry-actions">
          ${isRequest ? `<button class="small-action answer-action" data-action="answer" data-id="${escapeHTML(entry.id)}">✓ Answered</button>` : ""}
          <button class="small-action" data-action="edit" data-id="${escapeHTML(entry.id)}">Edit</button>
          <button class="small-action delete-action" data-action="delete" data-id="${escapeHTML(entry.id)}">Delete</button>
        </div>
      </div>
    </article>`;
}

function renderInto(containerId, list, emptyId, emptyMessage) {
  const container = document.getElementById(containerId);
  const empty = document.getElementById(emptyId);
  container.innerHTML = list.map(makeEntryCard).join("");
  container.style.display = list.length ? "grid" : "none";
  if (empty) {
    empty.classList.toggle("show", list.length === 0);
    const paragraph = empty.querySelector("p");
    if (paragraph && emptyMessage) paragraph.textContent = emptyMessage;
  }
}

function renderAll() {
  entries.sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""));
  $("#totalCount").textContent = entries.length;
  $("#requestCount").textContent = entries.filter(entry => entry.type === "request" && !entry.answered).length;
  $("#answeredCount").textContent = entries.filter(entry => entry.answered || entry.type === "answered").length;

  const recent = entries.slice(0, 4);
  renderInto("recentEntries", recent, "overviewEmpty", "Write down a prayer, a verse that stayed with you, or something you want to remember.");
  renderInto("journalEntries", filterJournal(), "journalEmpty");
  renderInto("requestEntries", entries.filter(entry => entry.type === "request" && !entry.answered), "requestsEmpty");
  renderInto("answeredEntries", entries.filter(entry => entry.answered || entry.type === "answered"), "answeredEmpty");
}

function filterJournal() {
  const query = ($("#searchInput")?.value || "").trim().toLowerCase();
  const filter = $("#journalFilter")?.value || "all";
  return entries.filter(entry => {
    const haystack = `${entry.title} ${entry.content} ${entry.verse || ""} ${typeLabels[entry.type] || ""}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesFilter = filter === "all"
      || (filter === "answered" ? (entry.answered || entry.type === "answered") : entry.type === filter);
    return matchesQuery && matchesFilter;
  });
}

function setView(view) {
  const validViews = ["overview", "journal", "requests", "answered"];
  activeView = validViews.includes(view) ? view : "overview";
  $$(".view-section").forEach(section => section.classList.toggle("active", section.id === `view-${activeView}`));
  $$(".nav-item[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === activeView));
  $("#breadcrumbPage").textContent = activeView.replace("-", " ").toUpperCase();
  $("#sidebar").classList.remove("open");
  if (activeView === "journal") renderInto("journalEntries", filterJournal(), "journalEmpty");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleEntryAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const entry = entries.find(item => item.id === button.dataset.id);
  if (!entry) return;

  if (button.dataset.action === "edit") {
    openEntryModal(entry);
  } else if (button.dataset.action === "delete") {
    if (!window.confirm(`Delete "${entry.title}"? This cannot be undone unless you have a backup.`)) return;
    entries = entries.filter(item => item.id !== entry.id);
    if (saveEntries()) {
      renderAll();
      showToast("Entry deleted.");
    }
  } else if (button.dataset.action === "answer") {
    entry.answered = true;
    entry.updatedAt = new Date().toISOString();
    if (saveEntries()) {
      renderAll();
      showToast("Prayer marked as answered.");
    }
  }
}

function exportBackup() {
  const backup = {
    app: "Stillword",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    entries
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `stillword-backup-${todayISO()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Your journal backup has been exported.");
}

async function importBackup(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const incoming = Array.isArray(data) ? data : data.entries;
    if (!Array.isArray(incoming)) throw new Error("Invalid backup");
    const validEntries = incoming.filter(item =>
      item && typeof item.id === "string" && typeof item.title === "string" &&
      typeof item.content === "string" && typeof item.date === "string" &&
      typeof item.type === "string" && typeLabels[item.type]
    );
    if (!window.confirm(`Import ${validEntries.length} entries? Entries with matching IDs will be replaced; other entries will be kept.`)) return;
    const map = new Map(entries.map(entry => [entry.id, entry]));
    validEntries.forEach(entry => map.set(entry.id, entry));
    entries = [...map.values()];
    if (data.profile && typeof data.profile.name === "string") {
      profile.name = data.profile.name.slice(0, 35);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      updateGreeting();
    }
    if (saveEntries()) {
      renderAll();
      showToast(`Imported ${validEntries.length} entries.`);
    }
  } catch {
    showToast("That file doesn't look like a valid Stillword backup.");
  } finally {
    $("#importFile").value = "";
  }
}

function initTheme() {
  let theme = "dark";
  try { theme = localStorage.getItem(THEME_KEY) || "dark"; } catch {}
  document.body.classList.toggle("light-mode", theme === "light");
  $("#themeButton").textContent = theme === "light" ? "☾" : "☼";
}

function toggleTheme() {
  const light = document.body.classList.toggle("light-mode");
  $("#themeButton").textContent = light ? "☾" : "☼";
  try { localStorage.setItem(THEME_KEY, light ? "light" : "dark"); } catch {}
}

function init() {
  $("#todayLabel").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());
  renderVerse();
  updateGreeting();
  initTheme();
  renderAll();

  $$(".nav-item[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  $$("[data-go]").forEach(button => button.addEventListener("click", () => setView(button.dataset.go)));
  $("#newEntryButton").addEventListener("click", () => openEntryModal());
  $$("[data-new-entry]").forEach(button => button.addEventListener("click", () => openEntryModal()));
  $$("[data-new-request]").forEach(button => button.addEventListener("click", () => openEntryModal(null, "request")));
  $("#anotherVerseButton").addEventListener("click", () => {
    verseIndex = (verseIndex + 1) % verses.length;
    renderVerse();
  });
  $("#themeButton").addEventListener("click", toggleTheme);
  $("#menuButton").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $("#profileButton").addEventListener("click", () => openModal("profileModal"));
  $("#entryForm").addEventListener("submit", event => {
    event.preventDefault();
    const id = $("#entryId").value || (window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const existing = entries.find(entry => entry.id === id);
    const type = $("#entryType").value;
    const entry = {
      id,
      title: $("#entryTitle").value.trim(),
      type,
      date: $("#entryDate").value,
      content: $("#entryContent").value.trim(),
      verse: $("#entryVerse").value.trim(),
      answered: type === "answered" || (existing ? Boolean(existing.answered) : false),
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!entry.title || !entry.content || !entry.date) {
      showToast("Please fill in the title, date, and your thoughts.");
      return;
    }
    const oldEntries = [...entries];
    entries = existing ? entries.map(item => item.id === id ? entry : item) : [entry, ...entries];
    if (saveEntries()) {
      closeModals();
      renderAll();
      showToast(existing ? "Your changes have been saved." : "Your entry has been saved.");
    } else {
      entries = oldEntries;
    }
  });
  $("#profileForm").addEventListener("submit", event => {
    event.preventDefault();
    profile.name = $("#displayName").value.trim().slice(0, 35);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
    updateGreeting();
    closeModals();
    showToast("Your journal name has been updated.");
  });
  $$("[data-close-modal]").forEach(button => button.addEventListener("click", closeModals));
  $$(".modal-backdrop").forEach(modal => modal.addEventListener("click", event => {
    if (event.target === modal) closeModals();
  }));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModals();
      $("#sidebar").classList.remove("open");
    }
  });
  ["recentEntries", "journalEntries", "requestEntries", "answeredEntries"].forEach(id => {
    document.getElementById(id).addEventListener("click", handleEntryAction);
  });
  $("#searchInput").addEventListener("input", () => renderInto("journalEntries", filterJournal(), "journalEmpty"));
  $("#journalFilter").addEventListener("change", () => renderInto("journalEntries", filterJournal(), "journalEmpty"));
  $("#exportButton").addEventListener("click", exportBackup);
  $("#importButton").addEventListener("click", () => $("#importFile").click());
  $("#importFile").addEventListener("change", event => importBackup(event.target.files[0]));
}

document.addEventListener("DOMContentLoaded", init);
