/* ============================================================
   TOP HOP — app.js
   Рендер данных из data.js + интерактив (фильтры, табы, шапка).
   ============================================================ */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* ---------------- ПИВО ---------------- */

  const beerGrid = $("#beerGrid");
  const beerFilters = $("#beerFilters");

  function beerCard(b) {
    const price2 = b.p2
      ? `<span class="beer-card__price beer-card__price--2"><b>${esc(b.p2)}</b><span>0.2 л</span></span>`
      : "";
    const price4 = b.p4
      ? `<span class="beer-card__price"><b>${esc(b.p4)}</b><span>0.4 л</span></span>`
      : "";
    return `
      <article class="beer-card" data-group="${b.group}">
        <div class="beer-card__num">${b.kran}<small>кран</small></div>
        <div>
          <div class="beer-card__name">${esc(b.name)}${b.fav ? '<span class="fav">★</span>' : ""}</div>
          <div class="beer-card__meta">
            <span class="tag tag--mint">${esc(b.style)}</span>
            ${b.abv ? `<span class="tag">${esc(b.abv)}% ABV</span>` : ""}
            ${b.ibu ? `<span class="tag">${esc(b.ibu)} IBU</span>` : ""}
            ${b.note ? `<span class="beer-card__note">${esc(b.note)}</span>` : ""}
          </div>
        </div>
        <div class="beer-card__prices">${price2}${price4}</div>
      </article>`;
  }

  function renderBeer(group = "all") {
    const list = group === "all" ? BEERS : BEERS.filter((b) => b.group === group);
    beerGrid.innerHTML = list.map(beerCard).join("");
  }

  function renderBeerFilters() {
    const counts = {};
    BEERS.forEach((b) => (counts[b.group] = (counts[b.group] || 0) + 1));
    const chips = [["all", `Все сорта`, BEERS.length]].concat(
      Object.keys(BEER_STYLES)
        .filter((g) => counts[g])
        .map((g) => [g, BEER_STYLES[g], counts[g]])
    );
    beerFilters.innerHTML = chips
      .map(
        ([g, name, n], i) =>
          `<button class="chip${i === 0 ? " active" : ""}" data-group="${g}" role="tab" aria-selected="${i === 0}">${esc(name)}<span class="chip__count">${n}</span></button>`
      )
      .join("");
    beerFilters.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      beerFilters.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("active", c === btn);
        c.setAttribute("aria-selected", c === btn ? "true" : "false");
      });
      renderBeer(btn.dataset.group);
    });
  }

  renderBeerFilters();
  renderBeer();

  /* ---------------- КУХНЯ ---------------- */

  const menuTabs = $("#menuTabs");
  const menuPanels = $("#menuPanels");

  function dishRow(d) {
    return `
      <div class="dish">
        <div class="dish__row">
          <span class="dish__name">${esc(d.name)}${d.isNew ? '<span class="badge-new">NEW</span>' : ""}</span>
          <span class="dish__dots"></span>
          <span class="dish__price">${d.price}<small>₽</small></span>
        </div>
        ${d.weight || d.note ? `<div class="dish__sub">${d.weight ? `<span class="dish__weight">${esc(d.weight)}</span>` : ""}${d.note ? `<span class="dish__note">${esc(d.note)}</span>` : ""}</div>` : ""}
        ${d.desc ? `<p class="dish__desc">${esc(d.desc)}</p>` : ""}
      </div>`;
  }

  MENU.forEach((cat, i) => {
    const tab = el(
      "button",
      "menu__tab" + (i === 0 ? " active" : ""),
      `<i>${cat.icon}</i>${esc(cat.title)}`
    );
    tab.dataset.target = cat.id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
    menuTabs.appendChild(tab);

    const panel = el(
      "div",
      "menu__panel" + (i === 0 ? " active" : ""),
      `<div class="menu__list">${cat.items.map(dishRow).join("")}</div>`
    );
    panel.id = `panel-${cat.id}`;
    panel.setAttribute("role", "tabpanel");
    menuPanels.appendChild(panel);
  });

  menuTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu__tab");
    if (!btn) return;
    menuTabs.querySelectorAll(".menu__tab").forEach((t) => {
      const active = t === btn;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    menuPanels.querySelectorAll(".menu__panel").forEach((p) => {
      p.classList.toggle("active", p.id === `panel-${btn.dataset.target}`);
    });
  });

  /* ---------------- КРЕПКОЕ ---------------- */

  $("#strongGrid").innerHTML = STRONG.map(
    (s) => `
      <div class="strong-card reveal">
        <div class="strong-card__head">
          <span class="strong-card__cat">${esc(s.cat)}</span>
          <span class="strong-card__vol">${esc(s.vol)}</span>
        </div>
        ${s.items
          .map(
            ([name, price]) => `
            <div class="strong-card__row">
              <b>${esc(name)}</b><span class="strong-card__dots"></span>
              <span class="strong-card__price">${price} ₽</span>
            </div>`
          )
          .join("")}
      </div>`
  ).join("");

  /* ---------------- ЛАНЧ ---------------- */

  $("#lunchCombos").innerHTML = LUNCH.combos
    .map(
      (c, i) => `
      <div class="combo reveal${i === 1 ? " combo--hit" : ""}">
        ${i === 1 ? '<span class="combo__flag">хит</span>' : ""}
        <div class="combo__price">${c.price}<small> ₽</small></div>
        <p class="combo__label">${esc(c.label)}</p>
      </div>`
    )
    .join("");

  $("#lunchBoard").innerHTML = LUNCH.sections
    .map(
      (s) => `
      <div class="lunch-col reveal">
        <div class="lunch-col__title">${esc(s.title)}</div>
        <ul>${s.items
          .map((it) => {
            const isNew = typeof it === "object";
            const name = isNew ? it.t : it;
            return `<li>${esc(name)}${isNew ? '<span class="badge-new">NEW</span>' : ""}</li>`;
          })
          .join("")}</ul>
      </div>`
    )
    .join("");

  const bf = LUNCH.breakfast;
  $("#lunchBreakfast").innerHTML = `
    <div>
      <div class="lunch__breakfast-title">${esc(bf.title)}
        <small>подача весь день · уточняй у официанта</small>
      </div>
    </div>
    <ul class="lunch__breakfast-items">${bf.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    <div class="lunch__breakfast-price">${bf.price}<small> ₽</small></div>`;

  /* ---------------- ШАПКА / МЕНЮ-БУРГЕР ---------------- */

  const header = $("#header");
  const burger = $("#burger");
  const nav = $("#nav");

  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a") && nav.classList.contains("open")) {
      nav.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });

  /* ---------------- появление при скролле ---------------- */

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));
})();
