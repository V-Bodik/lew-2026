(function(){
  // Active nav link based on current path
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.navlinks a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href && (href === path || (path === '' && href === 'index.html'))) a.classList.add('active');
  });

  // Prevent clicks on elements marked disabled
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-disabled="true"]');
    if (target){
      e.preventDefault();
    }
  });
})();
