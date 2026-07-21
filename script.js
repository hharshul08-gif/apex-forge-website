(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const menuBtn = $('.menu-btn');
  const nav = $('.nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  const form = $('#nutritionForm');
  if (form) {
    const steps = $$('.planner-step', form);
    const nextBtn = $('#nextStep');
    const prevBtn = $('#prevStep');
    const submitBtn = $('#generatePlan');
    const error = $('#plannerError');
    const progress = $('#plannerProgress');
    const counter = $('#stepCounter');
    const results = $('#nutritionResults');
    let step = 1;

    function showStep(number) {
      step = Math.max(1, Math.min(3, number));
      steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === step));
      prevBtn.hidden = step === 1;
      nextBtn.hidden = step === 3;
      submitBtn.hidden = step !== 3;
      progress.style.width = `${(step / 3) * 100}%`;
      counter.textContent = `Step ${step} of 3`;
      error.hidden = true;
    }

    function validateStep() {
      const active = steps[step - 1];
      const fields = $$('input, select', active);
      for (const field of fields) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
      if (step === 3 && !$('input[name="diet"]:checked', active)) {
        error.textContent = 'Please choose vegetarian, eggitarian or non-vegetarian.';
        error.hidden = false;
        return false;
      }
      return true;
    }

    nextBtn.addEventListener('click', () => { if (validateStep()) showStep(step + 1); });
    prevBtn.addEventListener('click', () => showStep(step - 1));

    const templates = {
      veg: {
        label: 'Vegetarian',
        meals: [
          ['Breakfast', 'Paneer bhurji, multigrain bread and one fruit'],
          ['Lunch', 'Paneer or soya, rice/roti, dal and 200 g green vegetables'],
          ['Evening', 'Whey or curd, fruit and a small portion of nuts'],
          ['Dinner', 'Paneer/tofu, rice/roti, curd and green vegetables'],
          ['Before bed', 'Curd or milk with optional isabgol']
        ]
      },
      egg: {
        label: 'Eggitarian',
        meals: [
          ['Breakfast', 'Whole eggs, multigrain bread and one fruit'],
          ['Lunch', 'Egg curry, dal, rice/roti and 200 g green vegetables'],
          ['Evening', 'Whey or curd, fruit and a cheese slice'],
          ['Dinner', 'Eggs or paneer, rice/roti, curd and green vegetables'],
          ['Before bed', 'Curd or milk with optional isabgol']
        ]
      },
      nonveg: {
        label: 'Non-vegetarian',
        meals: [
          ['Breakfast', 'Whole eggs, multigrain bread and one fruit'],
          ['Lunch', 'Chicken breast, dal, rice/roti and 200 g green vegetables'],
          ['Evening', 'Whey or curd, fruit and a cheese slice'],
          ['Dinner', 'Chicken breast, rice/roti, curd and green vegetables'],
          ['Before bed', 'Curd or milk with optional isabgol']
        ]
      }
    };

    const round5 = n => Math.max(0, Math.round(n / 5) * 5);
    const escapeHtml = value => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

    function foodText(base, mealIndex, targetCalories, diet, whey) {
      const scale = targetCalories / 1800;
      const rice = round5(35 * scale + (mealIndex === 1 || mealIndex === 3 ? 5 : 0));
      const proteinQty = round5((diet === 'nonveg' ? 110 : diet === 'egg' ? 100 : 120) * scale);
      const paneerQty = round5(90 * scale);
      const eggs = Math.max(2, Math.round(3 * scale));
      const fruit = Math.max(100, round5(180 * scale));
      const curd = Math.max(100, round5(180 * scale));
      let text = base;
      text = text.replace(/Chicken breast/g, `Chicken breast (${proteinQty} g)`)
        .replace(/Paneer or soya/g, `Paneer (${paneerQty} g) or soya chunks (${round5(45 * scale)} g dry)`)
        .replace(/Paneer\/tofu/g, `Paneer/tofu (${paneerQty} g)`)
        .replace(/Paneer bhurji/g, `Paneer bhurji (${paneerQty} g)`)
        .replace(/Whole eggs/g, `${eggs} whole eggs`)
        .replace(/Egg curry/g, `Egg curry (${eggs} eggs)`)
        .replace(/Eggs or paneer/g, `${eggs} eggs or paneer (${paneerQty} g)`)
        .replace(/one fruit/g, `one fruit (~${fruit} g)`)
        .replace(/rice\/roti/g, `${rice} g uncooked rice/atta`)
        .replace(/curd/g, `curd (${curd} g)`);
      if (!whey) text = text.replace(/Whey or /g, '').replace(/Whey/g, 'High-protein curd');
      return text;
    }

    function buildMeals({diet, meals, calories, protein, carbs, fat, whey}) {
      const template = templates[diet];
      const count = Number(meals);
      let selected;
      if (count === 3) selected = [template.meals[0], template.meals[1], template.meals[3]];
      else if (count === 5) selected = template.meals;
      else selected = template.meals.slice(0, 4);
      const weights = count === 3 ? [0.30, 0.37, 0.33] : count === 5 ? [0.22, 0.30, 0.13, 0.27, 0.08] : [0.25, 0.34, 0.15, 0.26];
      let usedP=0, usedC=0, usedF=0, usedCal=0;
      return selected.map((meal, i) => {
        const last = i === selected.length - 1;
        const p = last ? protein-usedP : Math.round(protein*weights[i]);
        const c = last ? carbs-usedC : Math.round(carbs*weights[i]);
        const f = last ? fat-usedF : Math.round(fat*weights[i]);
        const kcal = last ? calories-usedCal : Math.round(calories*weights[i]);
        usedP += p; usedC += c; usedF += f; usedCal += kcal;
        return {name:meal[0], food:foodText(meal[1], i, calories, diet, whey), p, c, f, kcal};
      });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateStep()) return;
      const d = new FormData(form);
      const sex = d.get('sex');
      const age = Number(d.get('age'));
      const height = Number(d.get('height'));
      const weight = Number(d.get('weight'));
      const activity = Number(d.get('activity'));
      const goal = d.get('goal');
      const trainingMultiplier = Number(d.get('training'));
      const diet = d.get('diet');
      const meals = Number(d.get('meals'));
      const whey = d.get('whey') === 'on';

      const bmr = 10*weight + 6.25*height - 5*age + (sex === 'male' ? 5 : -161);
      const maintenance = Math.round(bmr * activity);
      const floor = sex === 'male' ? 1500 : 1200;
      const multiplier = goal === 'loss' ? 0.82 : goal === 'gain' ? 1.08 : 1;
      const calories = Math.max(floor, Math.round(maintenance * multiplier / 25) * 25);
      const protein = Math.round(weight * trainingMultiplier);
      const proteinBasis = trainingMultiplier === 2 ? '2.0 g/kg · heavy gym-goer' : `${trainingMultiplier.toFixed(1)} g/kg · based on training`;
      const fat = Math.max(Math.round(weight * 0.7), Math.round((calories * 0.25) / 9));
      const carbs = Math.max(50, Math.round((calories - protein*4 - fat*9) / 4));
      const bmi = weight / ((height/100) ** 2);
      const bmiLabel = bmi < 18.5 ? 'Below healthy range' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Above healthy range' : 'High range';
      const water = Math.max(2, weight * 0.035).toFixed(1);
      const goalLabel = goal === 'loss' ? 'Fat-loss starting target' : goal === 'gain' ? 'Lean-gain starting target' : 'Maintenance target';
      const generated = buildMeals({diet, meals, calories, protein, carbs, fat, whey});

      $('#npBmi').textContent = bmi.toFixed(1);
      $('#npBmiLabel').textContent = bmiLabel;
      $('#npMaintenance').textContent = maintenance.toLocaleString('en-IN');
      $('#npCalories').textContent = calories.toLocaleString('en-IN');
      $('#npGoalLabel').textContent = goalLabel;
      $('#npWater').textContent = water;
      $('#npProtein').textContent = `${protein} g`;
      $('#npProteinBasis').textContent = proteinBasis;
      $('#npCarbs').textContent = `${carbs} g`;
      $('#npFat').textContent = `${fat} g`;
      $('#npTotal').textContent = `${calories.toLocaleString('en-IN')} kcal`;
      $('#npDietLabel').textContent = templates[diet].label;
      $('#npMealsLabel').textContent = `${meals} meals/day`;
      $('#mealPlanBody').innerHTML = generated.map(m => `<tr><td><strong>${escapeHtml(m.name)}</strong></td><td>${escapeHtml(m.food)}</td><td>${m.p} g</td><td>${m.c} g</td><td>${m.f} g</td><td>${m.kcal}</td></tr>`).join('');
      $('#mealProtein').textContent = `${protein} g`;
      $('#mealCarbs').textContent = `${carbs} g`;
      $('#mealFat').textContent = `${fat} g`;
      $('#mealCalories').textContent = `${calories} kcal`;
      $('#dailyBasics').textContent = `${water} L water, roughly ${goal === 'loss' ? '7,000–10,000' : '6,000–9,000'} steps and 7–8 hours of sleep. Green vegetables may be added generously unless medically restricted.`;

      form.hidden = true;
      results.hidden = false;
      results.scrollIntoView({behavior:'smooth', block:'start'});
    });

    $('#resetPlan').addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      results.hidden = true;
      showStep(1);
      form.scrollIntoView({behavior:'smooth', block:'start'});
    });
    $('#printPlan').addEventListener('click', () => window.print());
    showStep(1);
  }

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(x => { if (x.isIntersecting) x.target.classList.add('visible'); }), {threshold:.08}) : null;
  $$('.reveal').forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));
})();
