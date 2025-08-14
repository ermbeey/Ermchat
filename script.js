:root {
  --bg: #0b1020;
  --panel: #121833;
  --panel-2: #0f1530;
  --text: #e7ebff;
  --muted: #9aa3c7;
  --primary: #6a8cff;
  --primary-2: #88a4ff;
  --danger: #ff6b7a;
  --ok: #3ecf8e;
  --border: #233058;
  --shadow: 0 10px 30px rgba(0,0,0,.35);
  --radius: 16px;
}

* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  font: 15px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  color: var(--text);
  background: radial-gradient(1200px 800px at 20% -10%, #17204d, #0b1020);
}

.topbar {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  background: rgba(10,14,33,.6);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
}
.brand { display: flex; align-items: center; gap: 10px; }
.logo {
  width: 34px; height: 34px; border-radius: 12px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, var(--primary), #8a6aff);
  color: white; font-weight: 800;
  box-shadow: var(--shadow);
}
.nav { display: flex; gap: 8px; flex-wrap: wrap; }
.nav-btn {
  background: transparent; color: var(--text);
  border: 1px solid var(--border); border-radius: 12px;
  padding: 8px 12px; cursor: pointer;
}
.nav-btn:hover { border-color: var(--primary); }
.nav-btn.danger { border-color: #3b2232; color: #ff95a3; }
.nav-btn.danger:hover { border-color: var(--danger); color: white; background: #3b2232; }

main { padding: 24px; max-width: 1100px; margin: 0 auto; }
.card {
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: var(--shadow);
}
h1, h2, h3 { margin: 6px 0 12px; }
p { margin: 8px 0; }
hr { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
.small { font-size: 12px; }
.muted { color: var(--muted); }

.grid { display: grid; gap: 16px; }
.grid.two { grid-template-columns: 1fr 1fr; }
@media (max-width: 900px){ .grid.two { grid-template-columns: 1fr; } }

.row { display: flex; align-items: center; }
.row.between { justify-content: space-between; }
.row.gap { gap: 8px; }
.stack > * + * { margin-top: 8px; }

label { display: grid; gap: 6px; }
input, select, textarea, button {
  font: inherit; color: var(--text);
}
input, select, textarea {
  background: #0d1330; border: 1px solid var(--border);
  border-radius: 12px; padding: 10px 12px;
  outline: none;
}
input:focus, select:focus, textarea:focus { border-color: var(--primary); }

button {
  border: 1px solid var(--border);
  background: #0c1231; padding: 10px 14px;
  border-radius: 12px; cursor: pointer;
}
button.primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  border: none; color: #000813; font-weight: 700;
}
button.ghost { background: transparent; }
button.danger { background: #3b2232; border-color: #56263a; color: #ffb7c0; }
button.danger:hover { background: #482132; color: white; }

.file-btn {
  display: inline-grid; align-items: center;
  border: 1px dashed var(--border);
  padding: 8px 12px; border-radius: 12px; cursor: pointer;
}
.file-btn input { display: none; }
.file-btn.small { padding: 6px 10px; font-size: 13px; }

.footer { text-align: center; padding: 24px; color: var(--muted); }

.list { list-style: none; margin: 0; padding: 0; }
.list li {
  border: 1px solid var(--border); border-radius: 12px;
  padding: 10px 12px; margin: 8px 0; background: #0d1330;
  display: grid; gap: 6px;
}
.list li .meta { color: var(--muted); font-size: 12px; }
.list.selectable li { cursor: pointer; }
.list.selectable li.active { border-color: var(--primary); background: #0e1848; }

.stats { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.stats li { background: #0d1330; border: 1px solid var(--border); border-radius: 12px; padding: 8px 10px; }

.auth-card { max-width: 620px; margin: 40px auto; }
.tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.tab {
  background: #0c1231; border: 1px solid var(--border); color: var(--text);
  padding: 8px 12px; border-radius: 10px; cursor: pointer;
}
.tab.active { background: #12205a; border-color: var(--primary); }
.tabpanel { display: none; }
.tabpanel.active { display: block; }

.drop {
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 24px; text-align: center; color: var(--muted);
  margin-bottom: 12px;
}
.drop.drag { border-color: var(--primary); color: var(--text); }

.messages {
  height: 360px; overflow: auto; border: 1px solid var(--border);
  border-radius: 12px; padding: 10px; background: #0c1231;
}
.msg { margin: 10px 0; }
.msg .meta { color: var(--muted); font-size: 12px; margin-bottom: 6px; }
.msg .body { white-space: pre-wrap; background: #0d1330; padding: 10px; border-radius: 10px; }
.msg.me .body { background: #13204f; border: 1px solid #1f347a; }
.msg .attachments { margin-top: 6px; display: grid; gap: 6px; }
.attachment {
  display: inline-block; padding: 6px 10px; border: 1px solid var(--border);
  border-radius: 999px; background: #0b163f; font-size: 12px;
}

.hidden { display: none !important; }

