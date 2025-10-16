const maxImages = 11;
let images = JSON.parse(localStorage.getItem("images") || "[]");

function save() { localStorage.setItem("images", JSON.stringify(images)); }

function render() {
  document.body.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => window.open(src, "_blank"); // 画像表示
    img.oncontextmenu = e => { // 長押し削除
      e.preventDefault();
      if (confirm("削除しますか？")) {
        images.splice(i, 1);
        save(); render();
      }
    };
    document.body.appendChild(img);
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
          save(); render();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    };
    document.body.appendChild(add);
  }
}

render();
