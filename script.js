(() => {
  const stories = window.TALEATLAS_STORIES || [];
  const $ = id => document.getElementById(id);
  const symbols = {
    Kindness:"🐭", Wisdom:"🕷️", Courage:"🍑", Perseverance:"🐢", Community:"🥣",
    Friendship:"🐴", Honesty:"🐺", Carefulness:"🍲", Contentment:"🐟",
    "Problem-solving":"🐇", Gratitude:"🕊️"
  };
  let pageFlip = null, currentPage = 0, flipbookBuilt = false;
  const esc = s => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  function page(inner) {
    return `<div class="page"><div class="page-inner">${inner}</div></div>`;
  }
  function contentsPages() {
    const welcome = `
      <div class="page-label">Welcome, reader</div>
      <h3 class="page-title">A world inside these pages</h3>
      <p class="page-text">Every tale is a little doorway into another place and time. Meet clever animals, brave companions, and people who learn something important along the way.</p>
      <div class="page-art"><span class="art-symbol">🌳</span></div>
      <p class="page-text">Choose a story from the contents, or turn the page to begin your journey.</p><span class="folio">i</span>`;
    const list = stories.map((s, i) =>
      `<li><button type="button" class="contents-choice" data-story="${i}">${esc(s.title)}<small>${esc(s.country)} · ${esc(s.readingTime)}</small></button></li>`
    ).join("");
    const contents = `<div class="page-label">In this book</div><h3 class="page-title">Contents</h3><ol class="contents-list">${list}</ol><span class="folio">ii</span>`;
    return [page(welcome), page(contents)];
  }
  function storyPages(s, i) {
    const left = `<div class="page-label">${esc(s.region)} · ${esc(s.theme)}</div><h3 class="page-title">${esc(s.title)}</h3><div class="page-meta">${esc(s.country)} · ${esc(s.readingTime)} read</div><div class="page-text"><p>${esc(s.leftPage)}</p></div><span class="folio">${String(i*2+1).padStart(2,"0")}</span>`;
    const right = `<div class="page-label">The tale continues</div><div class="page-art"><span class="art-symbol">${symbols[s.theme]||"📖"}</span></div><div class="page-text"><p>${esc(s.rightPage)}</p></div><div class="lesson"><strong>A thought to keep</strong><p>${esc(s.moral)}</p></div><span class="folio">${String(i*2+2).padStart(2,"0")}</span>`;
    return [page(left), page(right)];
  }
  function buildFlipbook() {
    if (flipbookBuilt) return;
    $("flipbook").innerHTML = contentsPages().concat(...stories.map(storyPages)).join("");
    flipbookBuilt = true;
  }
  function updateControls(n = currentPage) {
    currentPage = Math.max(0, Math.min(n, stories.length*2+1));
    const isContents = currentPage < 2;
    const storyIndex = isContents ? -1 : Math.floor((currentPage-2)/2);
    $("reader-title").textContent = isContents ? "Contents" : (stories[storyIndex]?.title || "TaleAtlas");
    $("page-counter").textContent = isContents ? `${stories.length} stories · Contents` : `Story ${storyIndex+1} of ${stories.length} · Page ${currentPage-1}`;
    $("prev").disabled = currentPage <= 0;
    $("next").disabled = currentPage >= stories.length*2+1;
    $("prev").textContent = "← Previous page";
    $("next").textContent = currentPage >= stories.length*2+1 ? "End of book" : "Next page →";
  }
  function initFlipbook(startPage=0) {
    buildFlipbook();
    if (!pageFlip) {
      const host = $("flipbook"), mobile = window.matchMedia("(max-width: 760px)").matches;
      if (!window.St || !window.St.PageFlip) {
        $("reader-title").textContent = "Storybook unavailable";
        $("page-counter").textContent = "Please check your connection and reload.";
        return;
      }
      pageFlip = new window.St.PageFlip(host, {
        width: mobile ? 340 : 450, height: mobile ? 470 : 460,
        size: "stretch", minWidth: 260, maxWidth: 450,
        minHeight: 340, maxHeight: 520, drawShadow: true,
        maxShadowOpacity: 0.42, flippingTime: 850,
        usePortrait: true, startPage: 0, showCover: false,
        mobileScrollSupport: false, useMouseEvents: true,
        clickEventForward: true, swipeDistance: 30, autoSize: true
      });
      pageFlip.loadFromHTML(host.querySelectorAll(".page"));
      pageFlip.on("flip", event => updateControls(Number(event.data) || 0));
    }
    pageFlip.flip(Math.max(0, Math.min(startPage, stories.length*2+1)));
    updateControls(startPage);
    $("flipbook").querySelectorAll(".contents-choice").forEach(button => {
      button.addEventListener("click", () => openReader(2 + Number(button.dataset.story)*2));
    });
  }
  function openReader(pageNumber=0) {
    $("welcome").classList.add("hidden");
    $("reader").classList.remove("hidden");
    requestAnimationFrame(() => {
      initFlipbook(pageNumber);
      $("reader").scrollIntoView({behavior:"smooth",block:"start"});
    });
  }
  function closeReader() {
    $("reader").classList.add("hidden");
    $("welcome").classList.remove("hidden");
    $("welcome").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function nextPage(){ if(pageFlip && currentPage < stories.length*2+1) pageFlip.flipNext(); }
  function prevPage(){ if(pageFlip && currentPage > 0) pageFlip.flipPrev(); }
  function cards() {
    const q=$("search").value.trim().toLowerCase(), r=$("region-filter").value;
    const filtered=stories.map((s,i)=>({...s,index:i})).filter(s=>{
      const hay=`${s.title} ${s.region} ${s.country} ${s.theme} ${s.summary}`.toLowerCase(), context=`${s.region} ${s.country}`;
      const match=r==="all"||(r==="Asia"&&/asia|india|japan|south asia|east asia/i.test(context))||(r==="Africa"&&/africa|ghana|akan/i.test(context))||(r==="Europe"&&/europe|germany/i.test(context))||(r==="Ancient Greece"&&/ancient greece/i.test(s.region));
      return hay.includes(q)&&match;
    });
    $("story-count").textContent=`${stories.length} ${stories.length===1?"story":"stories"}`;
    $("story-grid").innerHTML=filtered.length?filtered.map(s=>`<article class="story-card"><div class="story-icon" aria-hidden="true">${symbols[s.theme]||"📖"}</div><div class="region">${esc(s.region)}</div><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p><div class="card-bottom"><span class="tag">${esc(s.theme)}</span><button class="read-link" data-read="${s.index}" type="button">Read story ↗</button></div></article>`).join(""):'<div class="empty">No stories found. Try another search.</div>';
    $("story-grid").querySelectorAll("[data-read]").forEach(button=>button.addEventListener("click",()=>openReader(2+Number(button.dataset.read)*2)));
  }
  $("open-book").addEventListener("click",()=>openReader(0));
  $("cover-stage").addEventListener("click",()=>openReader(0));
  $("contents-top").addEventListener("click",()=>openReader(0));
  $("close-book").addEventListener("click",closeReader);
  $("brand-home").addEventListener("click",e=>{e.preventDefault();closeReader();window.scrollTo({top:0,behavior:"smooth"});});
  $("about-button").addEventListener("click",()=>$("about-dialog").showModal());
  $("about-close").addEventListener("click",()=>$("about-dialog").close());
  $("about-dialog").addEventListener("click",e=>{if(e.target===$("about-dialog"))$("about-dialog").close();});
  $("prev").addEventListener("click",prevPage); $("next").addEventListener("click",nextPage);
  $("search").addEventListener("input",cards); $("region-filter").addEventListener("change",cards);
  document.addEventListener("keydown",e=>{if($("reader").classList.contains("hidden")||$("about-dialog").open)return;if(e.key==="ArrowRight")nextPage();if(e.key==="ArrowLeft")prevPage();if(e.key==="Escape")closeReader();});
  cards();
})();