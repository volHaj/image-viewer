const maxImages = 11;
let images = JSON.parse(localStorage.getItem("images") || "[]");

const gallery = document.getElementById("gallery");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");

function save() { localStorage.setItem("images", JSON.stringify(images)); }

function render() {
  gallery.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "thumb";
    img.onclick = () => openModal(src);
    img.oncontextmenu = e => {
      e.preventDefault();
      if (confirm("削除しますか？")) {
        images.splice(i, 1);
        save();
        render();
      }
    };
    gallery.appendChild(img);
  });

  if (images.length < maxImages) {
    const add = document.createElement("div");
    add.className = "add";
    add.textContent = "+";
    add.onclick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          images.push(reader.result);
          save();
          render();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    };
    gallery.appendChild(add);
  }
}

function openModal(src) {
  modalImg.src = src;
  modal.classList.remove("hidden");
  resetTransform();
}

modal.onclick = (e) => {
  // 背景クリックで閉じる（画像クリックは無視）
  if (e.target === modal) modal.classList.add("hidden");
};

// --- ピンチ＋パン処理 ---
let scale = 1;
let lastScale = 1;
let posX = 0;
let posY = 0;
let lastPosX = 0;
let lastPosY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

function resetTransform() {
  scale = 1; lastScale = 1;
  posX = 0; posY = 0;
  modalImg.style.transform = `translate(0px, 0px) scale(1)`;
}

// iPhone用ピンチイベント
modalImg.addEventListener("gesturestart", e => {
  e.preventDefault();
  lastScale = scale;
});
modalImg.addEventListener("gesturechange", e => {
  e.preventDefault();
  scale = Math.max(1, Math.min(4, lastScale * e.scale));
  updateTransform();
});
modalImg.addEventListener("gestureend", e => {
  e.preventDefault();
});

// ドラッグ移動（1本指パン）
modalImg.addEventListener("touchstart", e => {
  if (e.touches.length === 1 && scale > 1) {
    isPanning = true;
    startX = e.touches[0].clientX - posX;
    startY = e.touches[0].clientY - posY;
  }
});

modalImg.addEventListener("touchmove", e => {
  if (isPanning && e.touches.length === 1) {
    posX = e.touches[0].clientX - startX;
    posY = e.touches[0].clientY - startY;
    updateTransform();
  }
});

modalImg.addEventListener("touchend", e => {
  isPanning = false;
});

// ダブルタップでリセット
let lastTap = 0;
modalImg.addEventListener("touchend", e => {
  const now = Date.now();
  if (now - lastTap < 300) {
    resetTransform();
  }
  lastTap = now;
});

function updateTransform() {
  modalImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

render();
