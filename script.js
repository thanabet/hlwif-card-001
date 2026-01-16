// ====== CONFIG ======
const IMG_INTRO = "./assets/intro.png"; // HEY LOOK WHAT I FOUND (back-of-card)
const IMG_ITEM  = "./assets/item.png";  // item card
const IMG_KEEP  = "./assets/keep.png";  // KEEP EXPLORING

const IG_LINK = "https://www.instagram.com/intromie.studio?igsh=cXU2dmo3aTBxZW5z&utm_source=qr";

// ====== DOM ======
const card3d    = document.getElementById("card3d");
const frontImg  = document.getElementById("frontImg");
const backImg   = document.getElementById("backImg");
const frontFace = document.getElementById("frontFace");
const backFace  = document.getElementById("backFace");
const logoLink  = document.getElementById("logoLink");

logoLink.href = IG_LINK;

// ====== STATE ======
// Strategy (simple + stable):
// - Start: front=INTRO, back=ITEM, flipped=false (shows INTRO)
// - First tap: flip => shows ITEM (back). After flip ends: set front=KEEP.
// - After that: taps toggle flipped (ITEM <-> KEEP). Intro never comes back.
let introOnlyOnce = true;
let busy = false;

// ====== HELPERS ======
function runUV(faceEl){
  faceEl.classList.remove("uvRun");
  // force reflow so animation restarts
  void faceEl.offsetWidth;
  faceEl.classList.add("uvRun");
}

function setImages({ frontSrc, backSrc }){
  if (frontSrc) frontImg.src = frontSrc;
  if (backSrc)  backImg.src  = backSrc;
}

function enableKeepLogoHotspot(isKeepVisibleOnFront){
  // hotspot should be clickable only when KEEP image is on the currently visible side
  // In our design, KEEP is always on FRONT after first flip.
  logoLink.classList.toggle("isActive", isKeepVisibleOnFront);
}

function currentlyVisibleFace(){
  // if flipped => back is visible, else front is visible
  return card3d.classList.contains("isFlipped") ? "back" : "front";
}

function afterFlipUV(){
  // Run UV on whichever side is now visible
  if (currentlyVisibleFace() === "front") runUV(frontFace);
  else runUV(backFace);

  // logo hotspot active only when KEEP is visible (front side AND not flipped)
  // KEEP exists on front after intro phase; only clickable when front visible
  const keepClickable = (frontImg.src.includes("keep.png") && !card3d.classList.contains("isFlipped"));
  enableKeepLogoHotspot(keepClickable);
}

// ====== INIT ======
setImages({ frontSrc: IMG_INTRO, backSrc: IMG_ITEM });

// wait image load then UV on intro
frontImg.addEventListener("load", () => runUV(frontFace), { once:true });

// ====== INTERACTIONS ======
function flipCard(){
  if (busy) return;
  busy = true;

  // toggle flip
  card3d.classList.toggle("isFlipped");
}

card3d.addEventListener("click", (e) => {
  // If user clicks logo hotspot -> open IG and DO NOT flip
  if (e.target === logoLink) return;
  flipCard();
});

card3d.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    flipCard();
  }
});

// When flip transition completes, do the one-time intro logic + UV
card3d.addEventListener("transitionend", (e) => {
  if (e.propertyName !== "transform") return;

  // After first flip (intro -> item), replace front to KEEP permanently
  if (introOnlyOnce && card3d.classList.contains("isFlipped")) {
    // now ITEM is visible (back). we set FRONT to KEEP for future toggles.
    frontImg.src = IMG_KEEP;

    // pre-load keep so it doesn't flash
    const pre = new Image();
    pre.src = IMG_KEEP;

    introOnlyOnce = false;
  }

  afterFlipUV();
  busy = false;
});

// Make sure hotspot uses real click (not blocked)
logoLink.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent flip
  // open link normally (target=_blank already)
});
