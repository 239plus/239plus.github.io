(function(){
  var DIR = {olymp:"Олимпиады", entry:"Поступление", school:"Школьная программа", ege:"ЕГЭ", olymp911:"Олимпиады 9–11"};
  var PAL = ["#ff6a3d","#2f5bea","#14a37f","#a24bd6","#e0a21b","#d6456c"];

  function hash(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
  function typo(t){return String(t).replace(/(^|[\s(«])(в|и|с|к|о|у|а|на|по|не|за|до|из|от|без|для|—)\s+/gi,"$1$2\u00a0").replace(/(\d)\s+(₽|класс|мин)/g,"$1\u00a0$2").replace(/(ФМЛ)\s+(\d)/g,"$1\u00a0$2").replace(/ —/g,"\u00a0—")}
  function el(tag, cls, text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=typo(text);return e}
  function initials(n){return n.split(/\s+/).filter(Boolean).slice(0,2).map(function(w){return w[0]}).join("").toUpperCase()}

  function avatar(t){
    var a = el("div","ava");
    if (t.photo){var img=new Image();img.src=t.photo;img.alt=t.name;a.appendChild(img);return a}
    var c = PAL[hash(t.name)%PAL.length], c2 = PAL[(hash(t.name)+2)%PAL.length];
    a.style.background = "linear-gradient(135deg,"+c+","+c2+")";
    a.textContent = initials(t.name);
    return a;
  }

  function card(t){
    var c = el("article","card reveal");
    c.dataset.dirs = (t.directions||[]).join(" ");
    var top = el("div","card-top"); top.appendChild(avatar(t));
    var who = el("div"); who.appendChild(el("h3",null,t.name)); who.appendChild(el("div","sub",t.grade||""));
    if (t.role) who.appendChild(el("span","role",t.role));
    top.appendChild(who); c.appendChild(top);
    if (t.achievements && t.achievements.length){
      var ul = el("ul","ach"); t.achievements.forEach(function(a){ul.appendChild(el("li",null,a))}); c.appendChild(ul);
    }
    if (t.about) c.appendChild(el("p","about","«"+t.about.replace(/^«|»$/g,"")+"»"));
    var tags = el("div","tags");
    (t.topics||[]).forEach(function(x){tags.appendChild(el("span","tag",x))});
    (t.directions||[]).forEach(function(d){if(!DIR[d])return;var a=el(document.getElementById("dir-"+d)?"a":"span","tag",DIR[d]);if(a.tagName=="A"){a.href="#dir-"+d;a.classList.add("tag-link")}tags.appendChild(a)});
    c.appendChild(tags);
    var f = el("div","card-foot");
    f.appendChild(el("span",null,t.format || "Онлайн"));
    var a = el("a",null,"Записаться →"); a.href = "zapis.html?t=" + encodeURIComponent(t.name); f.appendChild(a);
    c.appendChild(f);
    return c;
  }

  var grid = document.getElementById("tutorGrid");
  if (grid) {
    TUTORS.forEach(function(t){grid.appendChild(card(t))});
    var join = el("article","card join");
    join.appendChild(el("h3",null,"Скоро здесь появятся новые репетиторы"));
    join.appendChild(el("p",null,"Команда собирается: победители и призёры олимпиад из 239."));
    grid.appendChild(join);
  }

  document.querySelectorAll(".filter").forEach(function(b){
    b.addEventListener("click",function(){
      document.querySelectorAll(".filter").forEach(function(x){x.setAttribute("aria-pressed","false")});
      b.setAttribute("aria-pressed","true");
      var f=b.dataset.f;
      if (grid) grid.querySelectorAll(".card:not(.join)").forEach(function(c){
        c.style.display = (f==="all" || c.dataset.dirs.split(" ").indexOf(f)>=0) ? "" : "none";
      });
    });
  });

  // ---- резюме ----
  var dlg = document.getElementById("dlg"), body = document.getElementById("dlgBody");
  function openDlg(nodes){ body.innerHTML = ""; var x = el("button","x","✕"); x.type = "button"; x.onclick = function(){ dlg.close() }; body.appendChild(x); nodes.forEach(function(n){ body.appendChild(n) }); dlg.showModal() }
  dlg.addEventListener("click", function(e){ if (e.target === dlg) dlg.close() });
  function list(title, items){ var f = document.createDocumentFragment(); if (!items || !items.length) return f; f.appendChild(el("h4",null,title)); var ul = el("ul"); items.forEach(function(i){ ul.appendChild(el("li",null,i)) }); f.appendChild(ul); return f }
  function resume(t){
    var head = el("div","card-top"); head.appendChild(avatar(t));
    var who = el("div"); who.appendChild(el("h3",null,t.name)); who.appendChild(el("div","sub",t.grade||"")); if (t.role) who.appendChild(el("span","role",t.role)); head.appendChild(who);
    var a = el("a","btn btn-primary","Записаться к репетитору →"); a.href = "zapis.html?t=" + encodeURIComponent(t.name); a.style.marginTop = "22px";
    var about = el("p",null,t.about||""); 
    openDlg([head, list("Достижения", t.achievements), list("Сильные темы", t.topics),
      list("Направления", (t.directions||[]).map(function(d){ return DIR[d] }).filter(Boolean)),
      list("Опыт", t.experience), t.about ? el("h4",null,"О себе") : document.createDocumentFragment(), about,
      list("Формат", [t.format || "Онлайн"]), a]);
  }

  // ---- запись ----
  var CATS = [["olymp","Олимпиады","с призёром ВсОШ · 3999 ₽"],["entry","Поступление в 239","5, 8, 9, 10 класс · 1999 ₽"],["school","Школьная программа 239","5 класс и старше · 1999 ₽"]];
  var WD = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"], MON = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
  var cat = "olymp", sel = {}, focus = null;
  function msk(){ var d = new Date(Date.now() + (new Date().getTimezoneOffset() + 180) * 60000); return d }  // «сейчас» по Москве
  function iso(d){ return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0") }
  // 3 дня назад … неделя вперёд
  function days(){ var out = [], now = msk(); for (var i = -3; i <= 7; i++){ out.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)) } return out }
  function slotsFor(name, d){
    var S = SCHEDULE[name]; if (!S) return [];
    if ((S.off||[]).indexOf(name + "|" + iso(d)) >= 0) return [];
    var now = msk(), nowM = now.getHours() * 60 + now.getMinutes();
    return ((S.week||{})[WD[d.getDay()]] || []).map(function(h){
      var p = h.split(":"), past = iso(d) < iso(now) || (iso(d) === iso(now) && +p[0] * 60 + +p[1] <= nowM);
      return {h: h, past: past, busy: (S.busy||[]).indexOf(name + "|" + iso(d) + "|" + h) >= 0};
    });
  }
  function renderCats(){
    var c = document.getElementById("cats"); c.innerHTML = "";
    CATS.forEach(function(x){ var b = el("button","cat",x[1]); b.type = "button"; b.appendChild(el("small",null,x[2])); b.setAttribute("aria-pressed", x[0] === cat); b.onclick = function(){ cat = x[0]; focus = null; renderBook() }; c.appendChild(b) });
  }
  var PRICE = {olymp: "3999 ₽", entry: "1999 ₽", school: "1999 ₽"}, day = null;
  // у каждого репетитора своя таблица: строки — время (по 30 мин), столбцы — дни (3 дня назад … неделя вперёд)
  function renderBook(){
    renderCats();
    var box = document.getElementById("bk"); box.innerHTML = "";
    var list = TUTORS.filter(function(t){ return (t.directions||[]).indexOf(cat) >= 0 });
    if (focus) list.sort(function(a,b){ return (b.name === focus) - (a.name === focus) });
    if (!list.length) { box.appendChild(el("p","empty","В этом направлении скоро появятся репетиторы.")); return }
    var ds = days(), today = iso(msk());
    var mins = function(h){ var p = h.split(":"); return +p[0] * 60 + +p[1] }, fmt = function(m){ return String(Math.floor(m / 60)).padStart(2,"0") + ":" + String(m % 60).padStart(2,"0") };
    list.forEach(function(t){
      var w = el("div","bk-t"), head = el("div","bk-head"); head.appendChild(avatar(t));
      var who = el("div"); who.appendChild(el("h3",null,t.name)); who.appendChild(el("div","sub",t.grade||"")); head.appendChild(who); w.appendChild(head);
      var hours = [], wk = (SCHEDULE[t.name] || {}).week || {};
      Object.keys(wk).forEach(function(k){ wk[k].forEach(function(h){ if (hours.indexOf(h) < 0) hours.push(h) }) });
      if (!hours.length) { w.appendChild(el("p","empty","Свободные окна скоро появятся.")); box.appendChild(w); return }
      hours.sort();
      var rows = []; for (var m = Math.floor(mins(hours[0]) / 30) * 30; m < mins(hours[hours.length-1]) + 60; m += 30) rows.push(fmt(m));
      var map = {}; ds.forEach(function(d){ map[iso(d)] = {}; slotsFor(t.name, d).forEach(function(x){ map[iso(d)][x.h] = x }) });
      var wrap = el("div","sched"), tb = document.createElement("table"), tr = document.createElement("tr");
      tr.appendChild(el("th","tcol",""));
      ds.forEach(function(d){
        var th = el("th","dcol" + (iso(d) === today ? " today" : iso(d) < today ? " pastd" : ""));
        th.appendChild(el("small",null,WD[d.getDay()])); th.appendChild(el("b",null,String(d.getDate()))); th.appendChild(el("small",null,MON[d.getMonth()]));
        tr.appendChild(th);
      });
      var thead = document.createElement("thead"); thead.appendChild(tr); tb.appendChild(thead);
      var tbody = document.createElement("tbody"), skip = {};
      rows.forEach(function(r){
        var tr = document.createElement("tr"); tr.appendChild(el("td","tcol" + (r.slice(3) === "00" ? "" : " half"), r.slice(3) === "00" ? r : ""));
        ds.forEach(function(d){
          var k = iso(d); if (skip[k + r]) return;
          var x = map[k][r], td = document.createElement("td");
          if (k === today) td.classList.add("today");
          if (!x) td.classList.add("c-off");
          else {
            td.rowSpan = 2; skip[k + fmt(mins(r) + 30)] = 1;
            var span = r + "–" + fmt(mins(r) + 60);
            if (x.busy || x.past) { td.classList.add("c-busy"); if (!x.busy) td.classList.add("c-past"); var bl = el("div","blk"); bl.appendChild(el("small",null,span)); bl.appendChild(el("b",null,x.busy ? "занято" : "прошло")); td.appendChild(bl) }
            else {
              td.classList.add("c-slot");
              var b = el("button","c-free"); b.type = "button"; b.setAttribute("aria-label", t.name + ", " + d.getDate() + " " + MON[d.getMonth()] + ", " + span + ", свободно");
              b.appendChild(el("small",null,span)); b.appendChild(el("b",null,PRICE[cat]));
              b.onclick = function(){ book(t, d, r) }; td.appendChild(b);
            }
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      tb.appendChild(tbody); wrap.appendChild(tb); w.appendChild(wrap); box.appendChild(w);
      // сразу показать сегодняшний день, а не прошедшие
      setTimeout(function(){ var th = wrap.querySelector("th.today"), tc = wrap.querySelector("th.tcol"); if (th) wrap.scrollLeft += th.getBoundingClientRect().left - wrap.getBoundingClientRect().left - tc.getBoundingClientRect().width }, 0);
    });
  }
  function book(t, d, h){
    var catName = CATS.filter(function(x){ return x[0] === cat })[0][1];
    var when = WD[d.getDay()].toLowerCase() + ", " + d.getDate() + " " + MON[d.getMonth()] + ", " + h;
    var text = "Здравствуйте! Хочу записаться на занятие «239+»: " + catName + ", репетитор " + t.name + ", " + when + " (МСК).";
    var h3 = el("h3",null,"Почти готово"), p = el("p",null,"Чтобы подтвердить бронирование времени и оплату, напишите организатору в Telegram — @" + BOOK_CONTACT + ". Окно станет занятым после подтверждения.");
    var bx = el("div","box",text);
    var acts = el("div","acts"), go = el("a","btn btn-primary","Написать @" + BOOK_CONTACT + " →");
    go.href = "https://t.me/" + BOOK_CONTACT + "?text=" + encodeURIComponent(text); go.target = "_blank"; go.rel = "noopener";
    var cp = el("button","btn btn-ghost","Скопировать текст"); cp.type = "button";
    cp.onclick = function(){ (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function(){ cp.textContent = "Скопировано ✓" }, function(){ cp.textContent = "Выделите текст выше" }) };
    acts.appendChild(go); acts.appendChild(cp);
    openDlg([h3, p, bx, acts]);
  }
  function pickTutor(t){ if ((t.directions||[]).indexOf(cat) < 0) cat = t.directions[0]; focus = t.name; renderBook() }
  if (document.getElementById("bk")) {
  var qt = new URLSearchParams(location.search).get("t"), qtT = TUTORS.filter(function(t){ return t.name === qt })[0];
  if (qtT) pickTutor(qtT); else renderBook();
  // свежая версия расписания в обход кэша GitHub Pages (кэш до 10 минут)
  fetch("schedule.js?t=" + Date.now(), {cache: "no-store"}).then(function(r){ return r.text() }).then(function(src){
    var fresh = new Function(src + "; return SCHEDULE;")();
    Object.keys(SCHEDULE).forEach(function(k){ delete SCHEDULE[k] }); Object.assign(SCHEDULE, fresh); renderBook();
  }).catch(function(){});
  }

  document.querySelectorAll(".js-contact").forEach(function(a){
    a.href = CONTACT_URL;
    if (/^https?:/.test(CONTACT_URL)){a.target="_blank";a.rel="noopener"}
  });

  var root = document.documentElement, KEY="t239";
  try{var s=localStorage.getItem(KEY); if(s) root.dataset.theme=s}catch(e){}
  document.getElementById("theme").addEventListener("click",function(){
    var dark = root.dataset.theme ? root.dataset.theme==="dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try{localStorage.setItem(KEY, root.dataset.theme)}catch(e){}
  });

  if ("IntersectionObserver" in window && !navigator.webdriver && !/Headless/.test(navigator.userAgent)){
    root.classList.add("js");
    var io = new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll(".reveal").forEach(function(x){io.observe(x)});
  } else document.querySelectorAll(".reveal").forEach(function(x){x.classList.add("in")});
})();
