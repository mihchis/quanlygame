// Component: Custom Glassmorphic Dialog (Alert/Confirm Replacements)

export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('custom-dialog-overlay');
    const titleEl = document.getElementById('custom-dialog-title');
    const msgEl = document.getElementById('custom-dialog-message');
    const iconEl = document.getElementById('custom-dialog-icon');
    const btnCancel = document.getElementById('btn-custom-dialog-cancel');
    const btnOk = document.getElementById('btn-custom-dialog-ok');
    
    if (!overlay || !titleEl || !msgEl || !btnOk || !btnCancel) {
      resolve(confirm(message));
      return;
    }
    
    titleEl.textContent = title || 'Xác nhận';
    msgEl.textContent = message;
    iconEl.textContent = '❓';
    iconEl.className = 'custom-dialog-icon info';
    btnCancel.style.display = 'inline-block';
    
    overlay.classList.add('active');
    
    const cleanup = (result) => {
      overlay.classList.remove('active');
      btnOk.removeEventListener('click', onOk);
      btnCancel.removeEventListener('click', onCancel);
      resolve(result);
    };
    
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    
    btnOk.addEventListener('click', onOk);
    btnCancel.addEventListener('click', onCancel);
  });
}

export function showAlert(title, message, iconType = 'info') {
  return new Promise((resolve) => {
    const overlay = document.getElementById('custom-dialog-overlay');
    const titleEl = document.getElementById('custom-dialog-title');
    const msgEl = document.getElementById('custom-dialog-message');
    const iconEl = document.getElementById('custom-dialog-icon');
    const btnCancel = document.getElementById('btn-custom-dialog-cancel');
    const btnOk = document.getElementById('btn-custom-dialog-ok');
    
    if (!overlay || !titleEl || !msgEl || !btnOk) {
      alert(message);
      resolve();
      return;
    }
    
    titleEl.textContent = title || 'Thông báo';
    msgEl.textContent = message;
    
    if (iconType === 'error') {
      iconEl.textContent = '❌';
      iconEl.className = 'custom-dialog-icon error';
    } else if (iconType === 'success') {
      iconEl.textContent = '✅';
      iconEl.className = 'custom-dialog-icon success';
    } else {
      iconEl.textContent = 'ℹ️';
      iconEl.className = 'custom-dialog-icon info';
    }
    
    btnCancel.style.display = 'none';
    
    overlay.classList.add('active');
    
    const cleanup = () => {
      overlay.classList.remove('active');
      btnOk.removeEventListener('click', onOk);
      resolve();
    };
    
    const onOk = () => cleanup();
    
    btnOk.addEventListener('click', onOk);
  });
}
