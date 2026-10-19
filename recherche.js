/* Recherche Terrahill : à inclure sur chaque page avec
   <script src="/recherche.js" defer></script>
   Charge /index-recherche.json (liste des entrées). */
(function () {
  "use strict";

  /* ---------- 1. Moteur de recherche (pur, testable) ---------- */

  // minuscules, sans accents, sans ponctuation : "Feïnn" -> "feinn"
  function norm(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // distance de Levenshtein (nombre de fautes entre deux mots)
  function lev(a, b) {
    var m = a.length, n = b.length, i, j, prev, cur, t;
    if (!m) return n; if (!n) return m;
    prev = []; for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) {
        t = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + t);
      }
      prev = cur;
    }
    return prev[n];
  }

  // score d'un texte (déjà normalisé) par rapport à la requête normalisée
  function scoreText(text, q) {
    if (text === q) return 100;
    if (text.indexOf(q) === 0) return 80;
    var words = text.split(" "), i, w;
    for (i = 0; i < words.length; i++) if (words[i].indexOf(q) === 0) return 60;
    if (text.indexOf(q) !== -1) return 40;
    // tolérance aux fautes de frappe, mot par mot
    if (q.length >= 4) {
      var tol = q.length >= 7 ? 2 : 1;
      for (i = 0; i < words.length; i++) {
        w = words[i].slice(0, q.length + 1);
        if (Math.abs(w.length - q.length) <= tol && lev(w, q) <= tol) return 25;
      }
    }
    return 0;
  }

  // prépare l'index : ajoute les formes normalisées
  function prepare(entries) {
    return entries.map(function (e) {
      return {
        n: e.n, c: e.c || "", u: e.u, a: e.a || [],
        _n: norm(e.n),
        _a: (e.a || []).map(norm)
      };
    });
  }

  function search(index, query, max) {
    var q = norm(query);
    if (!q) return [];
    var res = [];
    index.forEach(function (e) {
      var s = scoreText(e._n, q), i, t;
      for (i = 0; i < e._a.length; i++) {
        t = scoreText(e._a[i], q) - 5; // un alias vaut un peu moins que le nom
        if (t > s) s = t;
      }
      if (s > 0) res.push({ e: e, s: s });
    });
    res.sort(function (x, y) { return y.s - x.s || x.e._n.length - y.e._n.length; });
    return res.slice(0, max || 8).map(function (r) { return r.e; });
  }

  if (typeof module !== "undefined") module.exports = { norm: norm, lev: lev, prepare: prepare, search: search };
  if (typeof document === "undefined") return;

  /* ---------- 2. Interface ---------- */

  var INDEX_URL = "/index-recherche.json";
  var index = null, results = [], active = 0, box, input, list, btn;

  var css = [
    "#thr-btn{position:fixed;right:16px;top:16px;z-index:9998;width:46px;height:46px;border-radius:50%;",
    "border:2px solid #4a2504;background:#ffab00;color:#4a2504;font:22px/1 serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)}",
    "#thr-btn:hover,#thr-btn:focus-visible{background:#ffc43d;outline:2px solid #4a2504;outline-offset:2px}",
    "#thr-box{position:fixed;inset:0;z-index:9999;display:none;background:rgba(15,8,2,.72);",
    "padding:12vh 16px 0;font-family:Georgia,'Noto Serif',serif}",
    "#thr-box.open{display:block}",
    "#thr-panel{max-width:560px;margin:0 auto;background:#efdcaa;border:3px solid #4a2504;border-radius:6px;",
    "box-shadow:0 10px 40px rgba(0,0,0,.6);overflow:hidden}",
    "#thr-input{width:100%;box-sizing:border-box;padding:14px 16px;font:18px Georgia,serif;border:0;",
    "border-bottom:2px solid #4a2504;background:#fff6dc;color:#2a1400;outline:none}",
    "#thr-list{list-style:none;margin:0;padding:0;max-height:50vh;overflow:auto}",
    "#thr-list li{padding:10px 16px;cursor:pointer;display:flex;justify-content:space-between;gap:12px;color:#2a1400}",
    "#thr-list li.on,#thr-list li:hover{background:#4a2504;color:#ffe9b0}",
    "#thr-list small{opacity:.7;font-size:.8em;white-space:nowrap}",
    "#thr-hint{padding:8px 16px;font-size:.8em;color:#4a2504;border-top:1px solid #c9b48a}"
  ].join("");

  function el(tag, attrs, parent) {
    var x = document.createElement(tag), k;
    for (k in attrs) x.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(x);
    return x;
  }

  function build() {
    var st = el("style", {}, document.head); st.textContent = css;
    btn = el("button", { id: "thr-btn", type: "button", "aria-label": "Rechercher sur Terrahill", title: "Rechercher (touche /)" }, document.body);
    btn.textContent = "⌕";
    box = el("div", { id: "thr-box", role: "dialog", "aria-modal": "true", "aria-label": "Recherche" }, document.body);
    var panel = el("div", { id: "thr-panel" }, box);
    input = el("input", { id: "thr-input", type: "search", placeholder: "Chercher un personnage, un dieu, un bateau…", autocomplete: "off", "aria-label": "Recherche" }, panel);
    list = el("ul", { id: "thr-list", role: "listbox" }, panel);
    var hint = el("div", { id: "thr-hint" }, panel);
    hint.textContent = "↑↓ choisir · Entrée aller · Échap fermer";

    btn.addEventListener("click", open);
    box.addEventListener("mousedown", function (ev) { if (ev.target === box) close(); });
    input.addEventListener("input", update);
    input.addEventListener("keydown", onKey);
  }

  function load(cb) {
    if (index) return cb();
    fetch(INDEX_URL).then(function (r) { return r.json(); }).then(function (d) {
      index = prepare(d); cb();
    }).catch(function () { index = []; cb(); });
  }

  function open() { box.classList.add("open"); input.value = ""; list.innerHTML = ""; input.focus(); load(update); }
  function close() { box.classList.remove("open"); }

  function update() {
    if (!index) return;
    results = search(index, input.value, 8); active = 0;
    list.innerHTML = "";
    if (input.value && !results.length) {
      var li = el("li", {}, list); li.textContent = "Aucun résultat"; li.style.cursor = "default"; return;
    }
    results.forEach(function (e, i) {
      var li = el("li", { role: "option" }, list);
      var a = el("span", {}, li); a.textContent = e.n;
      var b = el("small", {}, li); b.textContent = e.c;
      li.addEventListener("click", function () { go(e); });
      li.addEventListener("mousemove", function () { active = i; mark(); });
    });
    mark();
  }

  function mark() {
    Array.prototype.forEach.call(list.children, function (li, i) { li.className = i === active ? "on" : ""; });
  }
  function go(e) { if (e) { close(); location.href = e.u; } }

  function onKey(ev) {
    if (ev.key === "ArrowDown") { ev.preventDefault(); if (results.length) { active = (active + 1) % results.length; mark(); } }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); if (results.length) { active = (active - 1 + results.length) % results.length; mark(); } }
    else if (ev.key === "Enter") { ev.preventDefault(); go(results[active]); }
    else if (ev.key === "Escape") { close(); }
  }

  document.addEventListener("keydown", function (ev) {
    var t = ev.target, typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); open(); }
    else if (ev.key === "/" && !typing) { ev.preventDefault(); open(); }
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();