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