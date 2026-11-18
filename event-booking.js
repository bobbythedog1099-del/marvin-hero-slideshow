(() => {
  const booking = document.querySelector('.event-booking');
  if (!booking) return;

  const faq = booking.querySelector('#event-booking-faq');
  const openBookingFAQ = () => {
    faq.open = true;
  };

  booking.querySelector('.event-booking__action').addEventListener('click', openBookingFAQ);
  if (location.hash === '#event-booking-faq') openBookingFAQ();

  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const output = booking.querySelector('.print-booth__output');
  const visibleFraction = 0.35;
  booking.classList.add('is-waiting-to-print');
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.intersectionRatio >= visibleFraction)) return;
    booking.classList.replace('is-waiting-to-print', 'is-printing');
    observer.disconnect();
  }, { threshold: visibleFraction });
  observer.observe(output);
})();
