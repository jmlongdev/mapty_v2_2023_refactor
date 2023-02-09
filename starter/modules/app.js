'use strict';
import Running from './Running.js';
import Cycling from './Cycling.js';
import Swimming from './Swimming.js';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const inputLap = document.querySelector('.form__input--lap');
const inputLift = document.querySelector('.form__input--lift');
const resetButton = document.querySelector('.reset__btn');
// const testBtn = document.querySelector('.testBtn');
let trashCan;

// Application Architecture
class App {
  #map;
  #mapZoom = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // get users positions
    this._getPosition();

    // Get data from localstorage
    this._getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleTypeField.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    resetButton.addEventListener('click', this.reset.bind(this));
    // testBtn.addEventListener('click', this._deleteWorkout.bind(this));
  }

  // Gets the coordinates of your location
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position.');
        }
      );
    }
  }

  //Happens First, gets the geolocation and renders the map
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    this.#map = L.map('map').setView([latitude, longitude], this.#mapZoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handles clicks on map
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(workout => {
      this._renderWorkoutMarker(workout);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideWorkoutForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
      inputLap.value =
      inputLift.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleTypeField() {
    //prettier-ignore
    if (inputType.value === 'running') {
      inputCadence.closest('.form__row').classList.remove('form__row--hidden');
      inputElevation.closest('.form__row').classList.add('form__row--hidden');
      inputLap.closest('.form__row').classList.add('form__row--hidden');
    } else if (inputType.value === 'swimming') {
      inputLap.closest('.form__row').classList.remove('form__row--hidden');
      inputCadence.closest('.form__row').classList.add('form__row--hidden');
      inputElevation.closest('.form__row').classList.add('form__row--hidden');
    } else if (inputType.value === 'cycling') {
      inputElevation.closest('.form__row').classList.remove('form__row--hidden');
      inputCadence.closest('.form__row').classList.add('form__row--hidden');
      inputLap.closest('.form__row').classList.add('form__row--hidden');
    } else if (inputType.value === 'weight_lifting') {
      inputCadence.closest('.form__row').classList.remove('form__row--hidden');
      inputElevation.closest('.form__row').classList.add('form__row--hidden');
      inputLap.closest('.form__row').classList.add('form__row--hidden');
      inputLift.closest('.form__row').classList.add('form__row--hidden');
    }
  }

  // Adding a new workout
  _newWorkout(e) {
    const isValidInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    const isPositive = (...inputs) => inputs.every(input => input > 0);
    e.preventDefault();

    // Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout is running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        //check valid data
        !isValidInputs(distance, duration, cadence) ||
        !isPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers');
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout is cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        //check valid data
        !isValidInputs(distance, duration, elevation) ||
        !isPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    if (type === 'swimming') {
      const laps = +inputLap.value;
      if (
        !isValidInputs(distance, duration, laps) ||
        !isPositive(distance, duration, laps)
      )
        return alert('Inputs have to be positive numbers');
      workout = new Swimming([lat, lng], distance, duration, laps);
    }

    if (type === 'weight_lifting') {
      const reps = +inputLift.value;
      if (
        !isValidInputs(distance, duration, reps) ||
        !isPositive(distance, duration, reps)
      )
        return alert('Inputs have to be positive numbers');
      workout = new WeightLifting([lat, lng], distance, duration, reps);
    }

    // Add new object to workout array
    this.#workouts.push(workout);
    console.log(this.#workouts);

    // render workout on map as marker
    this._renderWorkoutMarker(workout);
    // render workout on list
    this._renderWorkout(workout);
    // hide form and clear input fields
    this._hideWorkoutForm();
    //Set Local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${
          workout.type === 'running'
            ? '🏃‍♂️'
            : workout.type === 'cycling'
            ? '🚴‍♀️'
            : workout.type === 'swimming'
            ? '🏊🏻‍♂️'
            : workout.type === 'weight_lifting'
            ? '🏋️‍♀️'
            : ''
        }${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    // HTML markup
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">
          ${workout.description}
          <span id="delete" class="delete__btn">  
            <i class="fas fa-trash"></i>
          </span>
        </h2>
        <svg class="workout__menu-trigger workout__menu-icons">
          <use
            xlink:href="img/sprite.svg#icon-dots-three-horizontal"
          ></use>
        </svg>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running'
              ? '🏃‍♂️'
              : workout.type === 'cycling'
              ? '🚴‍♀️'
              : workout.type === 'swimming'
              ? '🏊🏻‍♂️'
              : workout.type === 'weight_lifting'
              ? '🏋️‍♀️'
              : ''
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">${
            workout.type === 'swimming' ? 'm' : 'km'
          }</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;
    /** Refactoring of the html ---
     * <div>
     * <span class="workout__value">
     * ${
     * workout.type === 'running'
     * ? workout.pace.toFixed(1)
     * : workout.type === 'cycling'
     * ? workout.speed.toFixed(1)
     * : workout.type === 'swimming'
     * ? workout.laps
     * : ''
     * }
     * </span>
     * <div>
     * <span class="workout__unit">min/km</span>
     * </div>
     */
    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>`;
    }
    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevation}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>`;
    }
    if (workout.type === 'swimming')
      html += `
        <div class="workout__details">
          <span class="workout__icon">🔁</span>
          <span class="workout__value">${workout.laps}</span>
          <span class="workout__unit">laps</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">🏊🏻‍♀️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">m/min</span>
        </div>
      </li>
`;
    if (workout.type === 'weight_lifting')
      html += `
        <div class="workout__details">
          <span class="workout__icon">🔁</span>
          <span class="workout__value">${workout.sets}</span>
          <span class="workout__unit">laps</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">🏋️‍♀️</span>
            <span class="workout__value">${workout.reps}</span>
        </div>
      </li>
`;
    form.insertAdjacentHTML('afterend', html);
    let trashCan = document.getElementById('delete');
    // console.log(trashCan);
    trashCan.addEventListener('click', this._deleteWorkout.bind(this));
  }

  // Hacky way but works
  _deleteWorkout(e) {
    //prettier-ignore
    const workoutElement = e.target.closest('.workout');
    // Gets the index of the workout to delete
    const index = this.#workouts.findIndex(
      workout => workout.id === workoutElement.dataset.id
    );
    this.#workouts.splice(index, 1);
    if (this.#workouts.length !== 0) {
      this._setLocalStorage();
      location.reload();
    } else {
      localStorage.removeItem('workouts');
      location.reload();
    }
    console.log(this.#workouts);
  }
  _moveToPopup(e) {
    const workoutElement = e.target.closest('.workout');
    if (!workoutElement) return;
    const workout = this.#workouts.find(
      workout => workout.id === workoutElement.dataset.id
    );
    console.log(workout);
    if (!workout) return;
    if (!this.#map) return;
    this.#map.setView(workout.coords, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
    console.log('click');
  }
}

const app = new App();
