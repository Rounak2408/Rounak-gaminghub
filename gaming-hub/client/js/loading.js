document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    const hide = () => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 700);
    };
    const bar = loader.querySelector('.loading-bar-inner');
    if (bar) {
      bar.addEventListener('animationend', hide, { once: true });
    } else {
      setTimeout(hide, 1200);
    }
  }
});
