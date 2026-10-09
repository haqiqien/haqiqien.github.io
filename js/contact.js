function validateField(field) {
  const value = field.value.trim();
  if (!value) return 'Kolom ini wajib diisi.';
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Masukkan alamat email yang valid.';
  }
  if (field.name === 'message' && value.length < 10) return 'Pesan minimal 10 karakter.';
  return '';
}

export function init() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return () => {};
  const fields = [...form.querySelectorAll('input, textarea')];
  const status = form.querySelector('[data-contact-status]');
  form.noValidate = true;

  const setError = (field, message) => {
    const error = document.getElementById(field.getAttribute('aria-describedby'));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
  };

  const onBlur = (event) => {
    const field = event.target;
    if (!fields.includes(field)) return;
    setError(field, validateField(field));
  };

  const onInput = (event) => {
    const field = event.target;
    if (fields.includes(field) && field.getAttribute('aria-invalid') === 'true') {
      setError(field, validateField(field));
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    let firstInvalid = null;
    for (const field of fields) {
      const message = validateField(field);
      setError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    }

    if (firstInvalid) {
      status.textContent = 'Periksa kembali kolom yang ditandai.';
      firstInvalid.focus();
      return;
    }

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const subject = `Pesan portofolio dari ${name}`;
    const body = `Nama: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `${form.action.split('?')[0]}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Membuka aplikasi email dengan pesan yang sudah disiapkan.';
    window.location.href = mailto;
  };

  form.addEventListener('blur', onBlur, true);
  form.addEventListener('input', onInput);
  form.addEventListener('submit', onSubmit);

  return function destroy() {
    form.removeEventListener('blur', onBlur, true);
    form.removeEventListener('input', onInput);
    form.removeEventListener('submit', onSubmit);
  };
}
