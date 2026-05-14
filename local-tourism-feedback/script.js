let currentLang = 'en';

const ratings = {
  1: 0,
  2: 0,
  3: 0,
  4: 0
};

function openSurvey() {

  document.getElementById('hero-section').style.display = 'none';

  document.getElementById('survey-page').classList.add('active');

  window.scrollTo(0, 0);
}

function goHome() {

  document.getElementById('success-screen').classList.remove('active');

  document.getElementById('survey-page').classList.remove('active');

  document.getElementById('hero-section').style.display = 'flex';

  resetForm();
}

function setRating(category, value) {

  ratings[category] = value;

  const row = document.getElementById('stars-' + category);

  row.querySelectorAll('.star').forEach((star, index) => {

    if(index < value) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }

  });
}

function submitSurvey() {

  document.getElementById('success-screen').classList.add('active');

  console.log("Survey Submitted!");
}

function resetForm() {

  document.getElementById('inp-name').value = '';
  document.getElementById('inp-date').value = '';
  document.getElementById('inp-revisit').value = '';
  document.getElementById('inp-recommend').value = '';

  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.checked = false;
  });

  for(let i = 1; i <= 4; i++) {

    ratings[i] = 0;

    document.querySelectorAll('#stars-' + i + ' .star').forEach(star => {
      star.classList.remove('active');
    });
  }
}

function toggleLang() {

  alert("Language switch sample only.");
}

(function initDateLimits() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const visitEl = document.getElementById('inp-date');
  if (visitEl) { 
      visitEl.min = '2020-01-01'; 
      visitEl.max = todayStr; 
  }
})();

function isDuplicate(name, date) {
  const key = (name.trim().toLowerCase() + '|' + date).replace(/\s+/g, '');
  const entries = JSON.parse(sessionStorage.getItem('survey_entries') || '[]');
  return entries.includes(key);
}
function recordEntry(name, date) {
  const key = (name.trim().toLowerCase() + '|' + date).replace(/\s+/g, '');
  const entries = JSON.parse(sessionStorage.getItem('survey_entries') || '[]');
  entries.push(key);
  sessionStorage.setItem('survey_entries', JSON.stringify(entries));
}

const negativePattern = /-\d+/;

if (negativePattern.test(contact)) {
  mark('inp-contact', true);
  errors.push('Negative numbers are not allowed.');
}

function toggleMiddleName() {

  const middleInput = document.getElementById("inp-middle-name");
  const checkbox = document.getElementById("no-middle-name");

  if (checkbox.checked) {
    middleInput.value = "N/A";
    middleInput.disabled = true;
    middleInput.style.opacity = "0.6";
  } 
  
  else {
    middleInput.value = "";
    middleInput.disabled = false;
    middleInput.style.opacity = "1";
  }
}