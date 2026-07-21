const form = document.getElementById('journeyForm');
const nameInput = document.getElementById('clientName');
const planInput = document.getElementById('planType');
const startInput = document.getElementById('startDate');
const resetButton = document.getElementById('resetJourney');
const STORAGE_KEY = 'builtBeyondJourneyV1';

const plans = {
  12: { name: 'Foundation', weeks: 12 },
  24: { name: 'Momentum', weeks: 24 },
  52: { name: 'Transformation', weeks: 52 }
};

function localDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

function render(data) {
  const plan = plans[data.plan] || plans[12];
  const start = localDate(data.start);
  const totalDays = plan.weeks * 7;
  const end = addDays(start, totalDays - 1);
  const today = dateOnly(new Date());
  const elapsedRaw = Math.floor((today - start) / 86400000);
  const completedDays = clamp(elapsedRaw + 1, 0, totalDays);
  const remainingDays = clamp(Math.ceil((end - today) / 86400000), 0, totalDays);
  const progress = clamp(Math.round((completedDays / totalDays) * 100), 0, 100);
  const currentWeek = clamp(Math.ceil(Math.max(completedDays, 1) / 7), 1, plan.weeks);

  let status = 'Active';
  let message = `Day ${completedDays} of your ${plan.weeks}-week journey. Keep building.`;
  if (today < start) { status = 'Upcoming'; message = `Your ${plan.name} plan begins on ${formatDate(start)}.`; }
  if (today > end) { status = 'Completed'; message = `You completed your ${plan.name} coaching cycle. Time to review what comes next.`; }

  document.getElementById('welcomeTitle').textContent = data.name ? `Welcome back, ${data.name}.` : 'Welcome back.';
  document.getElementById('journeyMessage').textContent = message;
  document.getElementById('statusPill').textContent = status;
  document.getElementById('statusPill').dataset.status = status.toLowerCase();
  document.getElementById('planLabel').textContent = plan.name;
  document.getElementById('planLength').textContent = `${plan.weeks} weeks · ${totalDays} days`;
  document.getElementById('startDisplay').textContent = formatDate(start);
  document.getElementById('endDisplay').textContent = formatDate(end);
  document.getElementById('remainingDisplay').textContent = remainingDays.toLocaleString('en-IN');
  document.getElementById('remainingNote').textContent = status === 'Completed' ? 'Plan completed' : 'Days until completion';
  document.getElementById('progressPercent').textContent = `${progress}%`;
  document.getElementById('dayCounter').textContent = `${completedDays} of ${totalDays} days completed`;
  document.getElementById('currentWeek').textContent = status === 'Upcoming' ? 'Starts soon' : `Week ${currentWeek} of ${plan.weeks}`;
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('progressBar').setAttribute('aria-valuenow', progress);
}

function saveAndRender(event) {
  event.preventDefault();
  if (!startInput.value) return;
  const data = { name: nameInput.value.trim(), plan: planInput.value, start: startInput.value };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render(data);
}

function loadJourney() {
  document.getElementById('year').textContent = new Date().getFullYear();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    startInput.valueAsDate = new Date();
    return;
  }
  try {
    const data = JSON.parse(saved);
    nameInput.value = data.name || '';
    planInput.value = data.plan || '12';
    startInput.value = data.start || '';
    if (data.start) render(data);
  } catch (_) { localStorage.removeItem(STORAGE_KEY); }
}

form.addEventListener('submit', saveAndRender);
[nameInput, planInput, startInput].forEach(field => field.addEventListener('change', () => {
  if (startInput.value) saveAndRender(new Event('submit'));
}));
resetButton.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  startInput.valueAsDate = new Date();
  location.reload();
});
loadJourney();
