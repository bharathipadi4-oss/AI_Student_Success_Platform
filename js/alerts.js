/**
 * Campus Pulse AI - Alert Notifications Engine
 * Manages institutional broadcasts, academic probation triggers, attendance warnings,
 * exam countdown reminders, and audio notifications.
 */
class AlertNotificationsEngine {
  constructor() {
    this.alerts = [];
    this.audioEnabled = true;
  }
  init() {
    // Load alerts from localStorage or fallback to initial alerts
    const saved = localStorage.getItem('campus_pulse_alerts');
    if (saved) {
      try {
        this.alerts = JSON.parse(saved);
      } catch (e) {
        this.alerts = window.CAMPUS_DATA ? window.CAMPUS_DATA.alerts : [];
      }
    } else if (window.CAMPUS_DATA && window.CAMPUS_DATA.alerts) {
        this.alerts = JSON.parse(JSON.stringify(window.CAMPUS_DATA.alerts));
    }
    this.bindEvents();
    this.render();
  }
  save() {
    localStorage.setItem('campus_pulse_alerts', JSON.stringify(this.alerts));
  }
  bindEvents() {
    // Dropdown toggle
    const bellBtn = document.getElementById('nav-btn-alerts');
    const drawer = document.getElementById('alert-drawer');
    const closeDrawerBtn = document.getElementById('alert-drawer-close');
    if (bellBtn && drawer) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !bellBtn.contains(e.target)) {
          drawer.classList.add('hidden');
        }
      });
    }
    if (closeDrawerBtn && drawer) {
      closeDrawerBtn.addEventListener('click', () => {
        drawer.classList.add('hidden');
      });
    }
    // Mark all read button
    const markAllBtn = document.getElementById('alert-btn-mark-all');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => this.markAllAsRead());
    }
    // Broadcast modal
    const broadcastBtn = document.getElementById('alert-btn-create-broadcast');
    const modal = document.getElementById('modal-create-alert');
    const modalClose = document.getElementById('modal-alert-close');
    const form = document.getElementById('form-create-alert');
    if (broadcastBtn && modal) {
      broadcastBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    if (modalClose && modal) {
      modalClose.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateBroadcast();
      });
    }
  }
  addAlert(alertObj) {
    const newAlert = {
      id: alertObj.id || `ALT-${Date.now()}`,
      type: alertObj.type || 'info', // critical, warning, info, success
      title: alertObj.title,
      message: alertObj.message,
      timestamp: 'Just now',
      actionText: alertObj.actionText || 'View Details',
      actionTarget: alertObj.actionTarget || 'analytics',
      read: false
    };
    this.alerts.unshift(newAlert);
    this.save();
    this.render();
    if (this.audioEnabled) {
      this.playAlertSound();
    }
  }
  handleCreateBroadcast() {
    const title = document.getElementById('alert-input-title').value.trim();
    const type = document.getElementById('alert-input-type').value;
    const target = document.getElementById('alert-input-target').value;
    const message = document.getElementById('alert-input-message').value.trim();
    if (!title || !message) {
      showToast('Please provide a title and message for the alert broadcast.', 'error');
      return;
    }
    this.addAlert({
      title: title,
      type: type,
      message: message,
      actionText: 'View Section',
      actionTarget: target
    });
    document.getElementById('modal-create-alert').classList.add('hidden');
    document.getElementById('form-create-alert').reset();
    showToast(`Campus broadcast "${title}" sent to students & faculty!`, 'success');
  }
  markAsRead(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      this.save();
      this.render();
    }
}
markAllAsRead() {
    this.alerts.forEach(a => a.read = true);
    this.save();
    this.render();
    showToast('All alerts marked as read.', 'info');
  }
  deleteAlert(alertId) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.save();
    this.render();
  }
  handleAlertAction(targetTab, alertId) {
    this.markAsRead(alertId);
    const drawer = document.getElementById('alert-drawer');
    if (drawer) drawer.classList.add('hidden');
    if (targetTab === 'analytics-at-risk') {
      window.switchTab('analytics');
      if (window.campusAnalytics) {
        const riskFilter = document.getElementById('analytics-filter-risk');
        if (riskFilter) riskFilter.value = 'High Risk';
        window.campusAnalytics.filters.riskLevel = 'High Risk';
        window.campusAnalytics.applyFilters();
      }
      } else if (targetTab === 'action-hub') {
      window.switchTab('analytics');
      const actionSection = document.getElementById('analytics-action-center');
      if (actionSection) actionSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.switchTab(targetTab);
    }
  }
  render() {
    const unreadCount = this.alerts.filter(a => !a.read).length;
    // Update Top Navigation Badge
    const badgeEl = document.getElementById('nav-alert-badge');
    if (badgeEl) {
      if (unreadCount > 0) {
        badgeEl.innerText = unreadCount > 9 ? '9+' : unreadCount;
        badgeEl.classList.remove('hidden');
      } else {
        badgeEl.classList.add('hidden');
      }
    }
    // Render Drawer List
    const drawerContainer = document.getElementById('alert-drawer-list');
    if (drawerContainer) {
      if (this.alerts.length === 0) {
        drawerContainer.innerHTML = `
          <div class="p-8 text-center text-slate-400 text-xs">
            <i class="fa-regular fa-bell-slash text-2xl mb-2 text-slate-300"></i>
            <p>No active alerts right now.</p>
          </div>
        `;
      } else {
        drawerContainer.innerHTML = this.alerts.map(a => this.getAlertItemHTML(a)).join('');
      }
    }
    // Render Dedicated Alerts Hub View (if user visits Alerts tab)
    const hubContainer = document.getElementById('alerts-hub-cards-container');
    if (hubContainer) {
      if (this.alerts.length === 0) {
        hubContainer.innerHTML = `
          <div class="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <i class="fa-regular fa-bell-slash text-4xl mb-3 text-slate-300"></i>
            <h4 class="text-base font-semibold text-slate-700">All Quiet on Campus</h4>
            <p class="text-xs text-slate-400 mt-1">There are no pending alerts or academic reminders.</p>
          </div>
        `;
      } else {
        hubContainer.innerHTML = this.alerts.map(a => `
          <div class="bg-white rounded-xl p-5 border ${!a.read ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-200 shadow-sm'} hover-lift flex flex-col justify-between">
          <div>
              <div class="flex items-start justify-between mb-2">
                <span class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${this.getTypeBadgeClass(a.type)}">
                  ${a.type}
                </span>
                <span class="text-xs text-slate-400">${a.timestamp}</span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm mb-1">${a.title}</h4>
              <p class="text-xs text-slate-600 leading-relaxed mb-4">${a.message}</p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button onclick="window.campusAlerts.handleAlertAction('${a.actionTarget}', '${a.id}')" 
                class="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                ${a.actionText} <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
              <button onclick="window.campusAlerts.deleteAlert('${a.id}')" class="text-slate-300 hover:text-red-500 text-xs">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        `).join('');
      }
    }
  }
  getAlertItemHTML(a) {
    return `
      <div class="p-3.5 border-b border-slate-100 ${!a.read ? 'bg-blue-50/40' : 'hover:bg-slate-50'} transition flex items-start gap-3 text-xs">
        <div class="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!a.read ? 'bg-blue-600 pulse-indicator' : 'bg-slate-300'}"></div>
        <div class="flex-1">
          <div class="flex items-start justify-between gap-1 mb-0.5">
            <h5 class="font-bold text-slate-900">${a.title}</h5>
            <span class="text-[10px] text-slate-400 shrink-0">${a.timestamp}</span>
          </div>
          <p class="text-slate-600 leading-relaxed mb-2">${a.message}</p>
          <div class="flex items-center gap-2">
            <button onclick="window.campusAlerts.handleAlertAction('${a.actionTarget}', '${a.id}')" 
              class="font-semibold text-blue-600 hover:underline flex items-center gap-1">
              ${a.actionText} &rarr;
            </button>
            ${!a.read ? `
              <span class="text-slate-300">&bull;</span>
              <button onclick="window.campusAlerts.markAsRead('${a.id}')" class="text-slate-400 hover:text-slate-700">
                Mark read
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
  getTypeBadgeClass(type) {
    if (type === 'critical') return 'bg-red-100 text-red-700 border border-red-200';
    if (type === 'warning') return 'bg-amber-100 text-amber-700 border border-amber-200';
    if (type === 'success') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    return 'bg-blue-100 text-blue-700 border border-blue-200';
  }
    playAlertSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }
}
window.addEventListener('DOMContentLoaded', () => {
  window.campusAlerts = new AlertNotificationsEngine();
  window.campusAlerts.init();
});