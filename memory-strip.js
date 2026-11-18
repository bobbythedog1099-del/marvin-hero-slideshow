(() => {
  const strip = document.querySelector('.memory-strip');
  if (!strip) return;

  const photos = [
    { src: 'assets/preview-img-billywedding.jpg', alt: 'Guests holding their MARVIN keepsakes' },
    { src: 'assets/ikea-poster.jpg', alt: 'Green and white cars parked side by side' },
    { src: 'assets/wedding-billy-poster.jpg', alt: 'Group posing together at a reception' }
  ];
  const indexBySource = new Map(photos.map((photo, index) => [photo.src, index]));

  const dialog = strip.querySelector('.event-gallery');
  const info = dialog.querySelector('.event-gallery__info');
  const stage = dialog.querySelector('.event-gallery__stage');
  const preview = dialog.querySelector('.event-gallery__image');
  const status = dialog.querySelector('.event-gallery__status');
  const metadata = dialog.querySelector('.event-gallery__metadata');
  const counter = dialog.querySelector('.event-gallery__counter');
  const sheet = dialog.querySelector('.event-gallery__sheet');
  const thumbnails = dialog.querySelector('.event-gallery__thumbnails');
  const previous = dialog.querySelector('.event-gallery__previous');
  const next = dialog.querySelector('.event-gallery__next');
  const announcement = dialog.querySelector('.event-gallery__announcement');
  let selected;
  let opener;
  let request = 0;
  let pageScroll;
  const photoNumber = index => String(index + 1).padStart(2, '0');
  const reels = strip.querySelectorAll('.memory-strip__reel');

  strip.querySelectorAll('.memory-strip__frame img').forEach(image => {
    const index = indexBySource.get(image.getAttribute('src'));
    if (index === undefined) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-strip__photo';
    button.setAttribute('aria-label', 'Open gallery: ' + photos[index].alt);
    button.setAttribute('aria-haspopup', 'dialog');
    image.before(button);
    button.append(image);
    const camera = document.createElement('span');
    camera.className = 'memory-strip__photo-camera';
    camera.setAttribute('aria-hidden', 'true');
    button.append(camera);
  });

  strip.querySelectorAll('.memory-strip__track').forEach(track => {
    const copy = track.firstElementChild.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('button').forEach(button => { button.tabIndex = -1; });
    track.append(copy);
  });

  function selectPhoto(index, reveal = false) {
    const photo = photos[index];
    selected = index;
    const currentRequest = ++request;
    const number = photoNumber(index);
    counter.textContent = number + ' / ' + photoNumber(photos.length - 1);
    metadata.textContent = 'FRAME ' + number + ' · MARVIN STUDIO';
    announcement.textContent = 'Photo ' + (index + 1) + ' of ' + photos.length + '. ' + photo.alt;

    const buttons = thumbnails.querySelectorAll('button');
    buttons.forEach((button, position) => {
      if (position === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    if (reveal) {
      const bounds = sheet.getBoundingClientRect();
      const thumbnail = buttons[index].getBoundingClientRect();
      const top = bounds.top + sheet.clientTop;
      const bottom = top + sheet.clientHeight;
      if (thumbnail.top < top) sheet.scrollTop += thumbnail.top - top;
      else if (thumbnail.bottom > bottom) sheet.scrollTop += thumbnail.bottom - bottom;
    }

    stage.setAttribute('aria-busy', 'true');
    preview.replaceChildren();
    status.textContent = 'Loading photo…';
    status.hidden = false;
    const image = new Image();
    image.alt = photo.alt;
    image.decoding = 'async';
    image.onload = () => {
      if (currentRequest !== request || !dialog.open) return;
      preview.replaceChildren(image);
      status.hidden = true;
      stage.setAttribute('aria-busy', 'false');
      if (photos.length > 1) {
        const neighbours = new Set([index - 1, index + 1].map(position =>
          (position + photos.length) % photos.length));
        neighbours.forEach(position => {
          const preload = new Image();
          preload.src = photos[position].src;
        });
      }
    };
    image.onerror = () => {
      if (currentRequest !== request || !dialog.open) return;
      status.textContent = 'This photo could not be loaded.';
      announcement.textContent += ' This photo could not be loaded.';
      stage.setAttribute('aria-busy', 'false');
    };
    image.src = photo.src;
  }

  function stepPhoto(direction) {
    if (photos.length < 2) return;
    selectPhoto((selected + direction + photos.length) % photos.length, true);
  }

  strip.addEventListener('click', event => {
    const photoButton = event.target.closest('.memory-strip__photo');
    if (!photoButton || dialog.open) return;

    const image = photoButton.querySelector('img');
    opener = photoButton;
    pageScroll = { x: window.scrollX, y: window.scrollY };
    const count = photos.length;
    info.textContent = count + (count === 1 ? ' photo' : ' photos');
    previous.hidden = next.hidden = count < 2;

    thumbnails.replaceChildren(...photos.map((photo, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.index = index;
      button.setAttribute('aria-label', 'Photo ' + (index + 1) + ': ' + photo.alt);
      const thumbnail = new Image();
      thumbnail.alt = '';
      thumbnail.loading = 'lazy';
      thumbnail.decoding = 'async';
      thumbnail.src = photo.thumbnail || photo.src;
      const label = document.createElement('span');
      label.textContent = photoNumber(index);
      button.append(thumbnail, label);
      item.append(button);
      return item;
    }));

    dialog.showModal();
    sheet.scrollTop = 0;
    selectPhoto(indexBySource.get(image.getAttribute('src')), true);
  });

  thumbnails.addEventListener('click', event => {
    const button = event.target.closest('button[data-index]');
    if (button) selectPhoto(Number(button.dataset.index));
  });

  previous.addEventListener('click', () => stepPhoto(-1));
  next.addEventListener('click', () => stepPhoto(1));
  dialog.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (photos.length < 2 || event.target === sheet || event.target.closest('input, select, textarea, [contenteditable]')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stepPhoto(event.key === 'ArrowLeft' ? -1 : 1);
  });

  let pressedBackdrop = false;
  dialog.addEventListener('pointerdown', event => { pressedBackdrop = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (pressedBackdrop && event.target === dialog) dialog.close();
    pressedBackdrop = false;
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    request++;
    preview.replaceChildren();
    opener?.focus({ preventScroll: true });
    if (pageScroll && (window.scrollX !== pageScroll.x || window.scrollY !== pageScroll.y)) {
      window.scrollTo({ left: pageScroll.x, top: pageScroll.y, behavior: 'instant' });
    }
  });

  reels.forEach(reel => {
    reel.addEventListener('focusin', event => {
      if (!event.target.matches('.memory-strip__photo:focus-visible')) return;
      if (event.target.closest('[aria-hidden="true"]')) return;
      reel.classList.add('is-keyboard-browsing');
      event.target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    reel.addEventListener('focusout', event => {
      if (reel.contains(event.relatedTarget)) return;
      if (!reel.classList.contains('is-keyboard-browsing')) return;
      reel.scrollLeft = 0;
      reel.classList.remove('is-keyboard-browsing');
    });
  });

  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        target.classList.toggle('is-offscreen', !isIntersecting);
      });
    });

    reels.forEach(reel => {
      reel.classList.add('is-offscreen');
      visibility.observe(reel);
    });
  }

  strip.classList.add('is-animated');
})();
