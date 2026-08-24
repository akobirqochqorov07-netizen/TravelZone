function adjustWidth(el) {
  const span = document.createElement("span");
  span.style.visibility = "hidden";
  span.style.whiteSpace = "pre";
  span.style.position = "absolute";
  span.style.font = getComputedStyle(el).font;
  span.textContent = el.textContent || el.getAttribute("aria-label") || "Dein Name";
  document.body.appendChild(span);
  el.style.width = span.offsetWidth + 4 + "px";
  document.body.removeChild(span);
}

function updateNameClean(name) {
  const cleanTags = document.querySelectorAll('[data-inserttag="nameclean"]');
  cleanTags.forEach(el => {
    if (name && name.length > 0) {
      el.textContent = ' ' + name;
    } else {
      el.textContent = '';
      const prev = el.previousSibling;
      if (prev && prev.nodeType === Node.TEXT_NODE) {
        prev.textContent = prev.textContent.replace(/\s+$/, '');
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const editableDivs = document.querySelectorAll('.username div[contenteditable]');
  const savedName = localStorage.getItem('username') || '';

  if (savedName) {
    editableDivs.forEach(el => {
      el.textContent = savedName;
      el.classList.remove('empty');
      adjustWidth(el);
    });
  }

  updateNameClean(savedName);

  editableDivs.forEach(el => {
    el.addEventListener('input', () => {
      const name = el.textContent.trim();

      if (name.length > 0) {
        localStorage.setItem('username', name);
        el.classList.remove('empty');
      } else {
        localStorage.removeItem('username');
        el.classList.add('empty');
      }

      adjustWidth(el);
      updateNameClean(name);
    });

    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') e.preventDefault();
    });

    adjustWidth(el);
  });

  window.addEventListener('storage', e => {
    if (e.key === 'username') {
      const newName = e.newValue || '';
      editableDivs.forEach(el => {
        el.textContent = newName;
        adjustWidth(el);
        if (newName) el.classList.remove('empty');
        else el.classList.add('empty');
      });
      updateNameClean(newName);
    }
  });
});
