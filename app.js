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
  scale = 1;
  modalImg.style.transform = `scale(1)`;
}

modal.onclick = () => {
  modal.classList.add("hidden");
};

let scale = 1;
let lastScale = 1;

modalImg.addEventListener("gesturestart", e => {
  e.preventDefault();
  lastScale = scale;
});
modalImg.addEventListener("gesturechange", e => {
  e.preventDefault();
  scale = Math.max(1, Math.min(4, lastScale * e.scale));
  modalImg.style.transform = `scale(${scale})`;
});
modalImg.addEventListener("gestureend", e => {
  e.preventDefault();
});

render();
