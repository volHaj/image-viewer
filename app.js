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
  if (e.target === modal) modal.classList.add("hidden");
};

// ---- ピンチズーム＋パン ----
let scale = 1, lastScale = 1;
let posX = 0, posY = 0;
let originX = 0, originY = 0;
let startDist = 0;
let startMid = { x: 0, y: 0 };
let isPanning = false;
let startPan = { x: 0, y: 0 };

function resetTransform() {
  scale = 1; lastScale = 1;
  posX = 0; posY = 0;
  originX = 0; originY = 0;
  updateTransform();
}

function updateTransform() {
  modalImg.style.transformOrigin = "0 0";
  modalImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function getMidpoint(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

// ピンチ開始
modalImg.addEventListener("touchstart", e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    startDist = getDistance(e.touches);
    startMid = getMidpoint(e.touches);
    lastScale = scale;
  } else if (e.touches.length === 1 && scale > 1) {
    isPanning = true;
    startPan.x = e.touches[0].clientX - posX;
    startPan.y = e.touches[0].clientY - posY;
  }
});

// ピンチ or パン中
modalImg.addEventListener("touchmove", e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const newDist = getDistance(e.touches);
    const mid = getMidpoint(e.touches);
    const deltaScale = newDist / startDist;
    const newScale = Math.max(1, Math.min(4, lastScale * deltaScale));

    // 拡大の中心を指の中心に追従させる
    const dx = (mid.x - originX);
    const dy = (mid.y - originY);
    posX -= dx * (newScale / scale - 1);
    posY -= dy * (newScale / scale - 1);
    originX = mid.x;
    originY = mid.y;

    scale = newScale;
    updateTransform();
  } else if (isPanning && e.touches.length === 1) {
    posX = e.touches[0].clientX - startPan.x;
    posY = e.touches[0].clientY - startPan.y;
    updateTransform();
  }
});

modalImg.addEventListener("touchend", e => {
  if (e.touches.length === 0) {
    isPanning = false;
  }
});

// ダブルタップでリセット
let lastTap = 0;
modalImg.addEventListener("touchend", e => {
  const now = Date.now();
  if (now - lastTap < 300) resetTransform();
  lastTap = now;
});

render();
