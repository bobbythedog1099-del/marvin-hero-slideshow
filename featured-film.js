(() => {
  const films = [...document.querySelectorAll('.featured-film')];
  films.forEach(film => {
    const video = film.querySelector('video');
    const play = film.querySelector('.play-symbol');
    const focus = film.querySelector('.film-focus');
    const duration = film.querySelector('.film-duration');
    const status = film.querySelector('.film-status');
    video.controls = false;
    focus.hidden = false;
    async function start() {
      status.hidden = true;
      if (!video.paused) {
        video.pause();
        return;
      }
      try {
        if (video.ended) video.currentTime = 0;
        await video.play();
      } catch (error) {
        if (error.name === 'AbortError') return;
        status.textContent = 'Unable to start playback. Try again or reload the page.';
        status.hidden = false;
      }
    }
    play.addEventListener('click', start);
    function updateDuration() {
      if (!Number.isFinite(video.duration)) return;
      const seconds = Math.round(video.duration);
      const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
      const remainder = String(seconds % 60).padStart(2, '0');
      duration.textContent = minutes + ':' + remainder;
    }
    video.addEventListener('durationchange', updateDuration);
    updateDuration();
    video.addEventListener('play', () => {
      films.forEach(other => { if (other !== film) other.querySelector('video')?.pause(); });
      updatePlaybackButton();
      status.hidden = true;
    });
    function updatePlaybackButton() {
      const playing = !video.paused && !video.ended;
      focus.classList.toggle('is-playing', playing);
      play.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + film.getAttribute('aria-label'));
    }
    video.addEventListener('pause', updatePlaybackButton);
    video.addEventListener('ended', updatePlaybackButton);
    video.addEventListener('error', () => {
      updatePlaybackButton();
      status.textContent = 'The film could not load. Please reload the page to try again.';
      status.hidden = false;
    });
  });
  const carousel = document.querySelector('.film-carousel');
  if (!carousel) return;
  let active = 0;
  function select(index) {
    index = (index + films.length) % films.length;
    carousel.scrollTo({ left: index * carousel.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  carousel.querySelectorAll('.film-arrow').forEach(arrow => {
    arrow.addEventListener('click', () => {
      const direction = arrow.classList.contains('film-arrow--next') ? 1 : -1;
      select(active + direction);
      carousel.focus({ preventScroll: true });
    });
  });
  carousel.addEventListener('keydown', event => {
    if (event.target !== carousel || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    select(active + (event.key === 'ArrowRight' ? 1 : -1));
  });
  function update() {
    const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
    active = Math.max(0, Math.min(films.length - 1, index));
    films.forEach((film, i) => {
      film.inert = i !== active;
      if (i !== active) film.querySelector('video').pause();
    });
  }
  carousel.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(() => {
    carousel.scrollTo({ left: active * carousel.clientWidth, behavior: 'instant' });
  }).observe(carousel);
  update();
})();
