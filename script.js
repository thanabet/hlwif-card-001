// script.js
const card = document.getElementById("card");
const cardInner = document.getElementById("cardInner");

const faceIntro = document.getElementById("faceIntro");
const faceItem  = document.getElementById("faceItem");
const keepTpl   = document.getElementById("keepTemplate");

let faceKeep = null;
let igHotspot = null;

// phase 0 = intro -> item (once)
// phase 1 = toggle item <-> keep
let phase = 0;

function playUV(face){
  const uv = face.querySelector(".uv");
  if (!uv) return;
  uv.classList.remove("play");
  void uv.offsetWidth;
  uv.classList.add("play");
}

window.addEventListener("load", () => {
  setTimeout(() => playUV(faceIntro), 150);
});

function goToKeep(){
  card.classList.add("isFlipped");
  cardInner.addEventListener("transitionend", function toKeep(e){
    if (e.propertyName !== "transform") return;
    cardInner.removeEventListener("transitionend", toKeep);
    playUV(faceKeep);
  });
}

function goToItem(){
  card.classList.remove("isFlipped");
  cardInner.addEventListener("transitionend", function toItem(e){
    if (e.propertyName !== "transform") return;
    cardInner.removeEventListener("transitionend", toItem);
    playUV(faceItem);
  });
}

card.addEventListener("click", () => {
  // If keep is present and user clicked on hotspot, let the link open (no flip)
  // (We also stopPropagation on hotspot click below.)
  if (phase === 0){
    // First flip: intro -> item (keep doesn't exist yet, so no flash possible)
    playUV(faceIntro);
    card.classList.add("isFlipped");

    cardInner.addEventListener("transitionend", function firstFlip(e){
      if (e.propertyName !== "transform") return;
      cardInner.removeEventListener("transitionend", firstFlip);

      // Remove intro from DOM (never comes back)
      faceIntro.remove();

      // Make item the new FRONT
      faceItem.classList.remove("back");
      faceItem.classList.add("front");

      // Create KEEP face now (was not rendered before)
      faceKeep = keepTpl.content.firstElementChild.cloneNode(true);
      cardInner.appendChild(faceKeep);

      // Hotspot: stop flip when clicking it
      igHotspot = faceKeep.querySelector("#igHotspot");
      igHotspot.addEventListener("click", (ev) => {
        ev.stopPropagation(); // IMPORTANT: prevents card click flip
        // link opens normally
      });

      // Reset to show item (no animation)
      cardInner.style.transition = "none";
      card.classList.remove("isFlipped");
      void cardInner.offsetHeight;
      cardInner.style.transition = "";

      playUV(faceItem);
      phase = 1;
    });

    return;
  }

  // Phase 1: toggle
  const goingToKeep = !card.classList.contains("isFlipped");
  if (goingToKeep) goToKeep();
  else goToItem();
});

// Keyboard (optional)
card.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " "){
    e.preventDefault();
    card.click();
  }
});
