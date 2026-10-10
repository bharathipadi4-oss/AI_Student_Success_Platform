/**
 * Campus Pulse AI - Core App Controller & Router
 * Main USP: "We don't just show student data; we turn it into actionable decisions that improve student success."
 */
// Global Toast Manager
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  let bg = 'bg-slate-900 text-white border-slate-700';
  let icon = 'fa-info-circle text-blue-400';
  if (type === 'success') {
    bg = 'bg-emerald-950 text-emerald-100 border-emerald-800';
    icon = 'fa-circle-check text-emerald-400';
  } else if (type === 'warning') {
    bg = 'bg-amber-950 text-amber-100 border-amber-800';
    icon = 'fa-triangle-exclamation text-amber-400';
  } else if (type === 'error') {
    bg = 'bg-red-950 text-red-100 border-red-800';
    icon = 'fa-circle-xmark text-red-400';
  }
  toast.className = `toast max-w-sm w-full p-4 rounded-xl shadow-xl border text-xs flex items-start gap-3 backdrop-blur-md ${bg}`;
  toast.innerHTML = `
    <i class="fa-solid ${icon} text-base mt-0.5"></i>
    <div class="flex-1 font-medium leading-relaxed">${message}</div>
    <button class="text-slate-400 hover:text-white transition ml-2" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark text-sm"></i>
    </button>
  `;
  container.appendChild(toast);
   // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};
// Global Tab Router
window.switchTab = function(tabName) {
  // Update nav buttons
  const navLinks = document.querySelectorAll('.nav-tab-btn');
  navLinks.forEach(link => {
    if (link.dataset.tab === tabName) {
      link.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
      link.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
    } else {
      link.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
      link.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
    }
  });
  // Switch tab contents
  const sections = document.querySelectorAll('.tab-content');
  sections.forEach(sec => {
    if (sec.id === `tab-${tabName}`) {
      sec.classList.remove('hidden');
      setTimeout(() => sec.classList.add('active'), 20);
    } else {
      sec.classList.remove('active');
      sec.classList.add('hidden');
    }
  });
  // Close mobile sidebar if open
  const sidebar = document.getElementById('mobile-sidebar');
  if (sidebar && !sidebar.classList.contains('hidden')) {
    sidebar.classList.add('hidden');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' 
  });
};
// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Bind tab click events
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.tab;
      window.switchTab(target);
    });
  });
  // Mobile menu toggle
const mobileToggle = document.getElementById('btn-mobile-menu');
  const mobileSidebar = document.getElementById('mobile-sidebar');
  const mobileClose = document.getElementById('btn-mobile-close');
  if (mobileToggle && mobileSidebar) {
    mobileToggle.addEventListener('click', () => {
      mobileSidebar.classList.remove('hidden');
    });
  }
  if (mobileClose && mobileSidebar) {
    mobileClose.addEventListener('click', () => {
      mobileSidebar.classList.add('hidden');
    });
  }
  // Keyboard shortcut: Escape closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');
      modals.forEach(m => m.classList.add('hidden'));
    }
  });
  console.log("Campus Pulse AI initialized successfully.");
});