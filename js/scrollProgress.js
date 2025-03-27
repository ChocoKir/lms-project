window.addEventListener('scroll', () => {
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }
});
