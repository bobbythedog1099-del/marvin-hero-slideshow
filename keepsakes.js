(() => {
  const section = document.querySelector('.keepsakes');
  if (!section) return;

  const tablist = section.querySelector('.keepsakes__tabs');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const cards = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const controls = section.querySelector('.keepsakes__controls');
  const count = controls.querySelector('.keepsakes__count');
  const format = number => String(number).padStart(2, '0');
  let active = 0;

  function select(index) {
    active = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, position) => {
      const selected = position === active;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      cards[position].hidden = !selected;
    });
    count.textContent = format(active + 1) + ' / ' + format(tabs.length);
  }

  tabs.forEach((tab, index) => {
    const card = cards[index];
    card.setAttribute('role', 'tabpanel');
    card.setAttribute('aria-labelledby', tab.id);
    tab.addEventListener('click', () => select(index));
  });

  tablist.addEventListener('keydown', event => {
    const targets = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: tabs.length - 1 };
    if (!Object.hasOwn(targets, event.key)) return;
    event.preventDefault();
    select(targets[event.key]);
    tabs[active].focus();
  });

  controls.querySelector('.keepsakes__previous').addEventListener('click', () => select(active - 1));
  controls.querySelector('.keepsakes__next').addEventListener('click', () => select(active + 1));

  select(0);
  tablist.hidden = false;
  controls.hidden = false;
})();
