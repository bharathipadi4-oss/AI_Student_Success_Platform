
/* Campus Pulse AI - Navigation Controller */

window.switchTab = function (tabName) {
  const targetSection = document.getElementById(`tab-${tabName}`);

  if (!targetSection) {
    console.error(`Navigation section not found: tab-${tabName}`);
    return;
  }

  // Show the selected section and hide the others
  document.querySelectorAll('.tab-content').forEach((section) => {
    const isActive = section.id === `tab-${tabName}`;
    section.classList.toggle('hidden', !isActive);
    section.classList.toggle('active', isActive);
  });

  // Update navigation button styles
  document.querySelectorAll('.nav-tab-btn').forEach((button) => {
    const isActive = button.dataset.tab === tabName;

    button.classList.toggle('bg-blue-600', isActive);
    button.classList.toggle('text-white', isActive);
    button.classList.toggle('shadow-sm', isActive);

    if (isActive) {
      button.classList.remove(
        'text-slate-400',
        'hover:text-white',
        'hover:bg-slate-800'
      );
    } else {
      button.classList.add(
        'text-slate-400',
        'hover:text-white',
        'hover:bg-slate-800'
      );
    }
  });

  // Close mobile sidebar after selecting a tab
  const mobileSidebar = document.getElementById('mobile-sidebar');
  if (mobileSidebar) {
    mobileSidebar.classList.add('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Register navigation events
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;

      if (tabName) {
        window.switchTab(tabName);
      } else {
        console.error('Navigation button is missing its data-tab attribute.');
      }
    });
  });

  // Mobile navigation menu
  const mobileToggle = document.getElementById('btn-mobile-menu');
  const mobileSidebar = document.getElementById('mobile-sidebar');
  const mobileClose = document.getElementById('btn-mobile-close');

  mobileToggle?.addEventListener('click', () => {
    mobileSidebar?.classList.remove('hidden');
  });

  mobileClose?.addEventListener('click', () => {
    mobileSidebar?.classList.add('hidden');
  });

  console.log('Campus Pulse AI navigation initialized.');
});