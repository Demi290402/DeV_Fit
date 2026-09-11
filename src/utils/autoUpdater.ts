// Sistema di aggiornamento automatico live per DeV Fit
export const notifyDataChanged = () => {
  window.dispatchEvent(new CustomEvent('df_data_updated'));
};

let isUpdating = false;

export const initAutoUpdater = (getActiveWorkout?: () => any) => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              triggerReload('Nuovo aggiornamento PWA pronto.');
            }
          });
        }
      });
    }).catch(() => {});

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      triggerReload('Nuova versione applicata.');
    });
  }

  const checkVersion = async () => {
    if (isUpdating) return;
    try {
      const res = await fetch('/version.json?t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (!res.ok) return;
      const data = await res.json();
      
      if (typeof __APP_BUILD_TIME__ !== 'undefined' && data.buildTime) {
        if (data.buildTime > __APP_BUILD_TIME__) {
          triggerReload('Nuova versione disponibile!');
        }
      }
    } catch {
      // offline
    }
  };

  const triggerReload = (msg: string) => {
    if (isUpdating) return;
    if (getActiveWorkout && getActiveWorkout()) {
      showUpdateBadge();
      return;
    }

    isUpdating = true;
    showToast(msg);
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  const showToast = (message: string) => {
    const existing = document.getElementById('df-update-toast');
    if (existing) return;
    const toast = document.createElement('div');
    toast.id = 'df-update-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'linear-gradient(135deg, #d4af37 0%, #f6e09a 100%)';
    toast.style.color = '#050506';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '99px';
    toast.style.fontSize = '0.78rem';
    toast.style.fontWeight = '800';
    toast.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
    toast.style.zIndex = '99999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.innerHTML = '<span>⚡</span> <span>' + message + ' Ricaricamento in corso...</span>';
    document.body.appendChild(toast);
  };

  const showUpdateBadge = () => {
    const existing = document.getElementById('df-update-badge');
    if (existing) return;
    const badge = document.createElement('div');
    badge.id = 'df-update-badge';
    badge.style.position = 'fixed';
    badge.style.top = '12px';
    badge.style.right = '12px';
    badge.style.background = '#d4af37';
    badge.style.color = '#000';
    badge.style.padding = '6px 14px';
    badge.style.borderRadius = '99px';
    badge.style.fontSize = '0.72rem';
    badge.style.fontWeight = '800';
    badge.style.cursor = 'pointer';
    badge.style.zIndex = '99999';
    badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    badge.innerText = '⚡ Aggiorna app';
    badge.onclick = () => window.location.reload();
    document.body.appendChild(badge);
  };

  setTimeout(checkVersion, 3000);
  const interval = setInterval(checkVersion, 30000);

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkVersion();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('focus', checkVersion);
  window.addEventListener('online', checkVersion);

  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('focus', checkVersion);
    window.removeEventListener('online', checkVersion);
  };
};
