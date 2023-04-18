'use strict';

// prettier-ignore
//const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const months= {
  Jan: '01',
Feb: '02',
Mar: '03',
Apr: '04',
May: '05',
Jun: '06',
Jul: '07',
Aug: '08',
Sep: '09',
Oct: '10',
Nov: '11',
Dec: '12',
};

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputSPM = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const submitBtn = document.querySelector('.form__btn');

class workout {
  date;
  id;
  month;
  day;

  //                    [km]     [min]
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.idCalc();
  }
  idCalc() {
    this.date = new Date();
    const [, month, day, year, time] = this.date.toString().split(' ');
    this.day = day;
    this.month = month;
    const [hour, minute, secound] = time.split(':');
    this.id = `${year}${months[month]}${day}${hour}${minute}${secound}`;
    return this.id;
  }
}

class running extends workout {
  type = 'running';
  tempoRunning;
  constructor(coords, distance, duration, SPM) {
    super(coords, distance, duration);
    this.SPM = SPM;
    this.tempoRunningCalc();
  }
  tempoRunningCalc() {
    this.tempoRunning = Math.round((this.duration * 10) / this.distance) / 10;
    return this.tempoRunning;
    //Math.round(this.tempoRunning * 10) / 10;
  }
}

class cycling extends workout {
  type = 'cycling';
  avrageSpeed;
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.avrageSpeedCalc();
  }
  avrageSpeedCalc() {
    this.avrageSpeed = Math.round((this.distance / this.duration) * 10) / 10;
    return this.avrageSpeed;
  }
}

const run1 = new running([20, 30], 3, 20, 50);
const cycling1 = new cycling([40, 20], 20, 60, 500);

class App {
  #map;
  #mapEvent;
  #marker;
  #workouts = [];
  markers = [];

  constructor() {
    this._getPosition();
    this.getLocalStorage();
    submitBtn.addEventListener('click', this._newWorkout.bind(this));
    //deleteWorkoutButton.addEventListener('click');
    inputType.addEventListener('change', this._toogleElevationField.bind(this));
    containerWorkouts.addEventListener(
      'click',
      this.focusOnSpecificElement.bind(this)
    );
  }
  displayButton(workoutEl) {
    const deleteWorkoutButton = document.querySelectorAll(
      '.deleteWorkoutButton'
    );
    const editWorkoutButton = document.querySelectorAll('.edit_btn');

    deleteWorkoutButton.forEach(btn => btn.classList.add('btn_hidden'));
    editWorkoutButton.forEach(btn => btn.classList.add('btn_hidden'));
    // console.log(deleteWorkoutButton);
    workoutEl
      .querySelector('.deleteWorkoutButton')
      .classList.remove('btn_hidden');
    workoutEl.querySelector('.edit_btn').classList.remove('btn_hidden');
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this));
    } else alert('ehh');
  }
  _loadMap(position) {
    const currentCoords = [position.coords.latitude, position.coords.longitude];
    this.#map = L.map('map').setView(currentCoords, 17);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      //if (!work == null) {
      this.marker(work, work.coords[0], work.coords[1]);
      // }
    });
  }
  displayDate(date) {
    const [, month, day, year, time] = date.toString().split(' ');
    return `${day}.${months[month]}.${year} ${time}`;
  }

  _showForm(e) {
    this.#mapEvent = e;
    console.log(e);
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  cleanInputs() {
    inputSPM.value = inputDistance.value = inputDuration.value = '';
  }
  _toogleElevationField() {
    this.cleanInputs();
    if (inputType.value === 'running') {
      form.children.item(3).classList.remove('form__row--hidden');
      form.children.item(4).classList.add('form__row--hidden');
    }
    if (inputType.value === 'cycling') {
      form.children.item(4).classList.remove('form__row--hidden');
      form.children.item(3).classList.add('form__row--hidden');
    }
  }
  //console.log('ok');
  isInputValid(...inputs) {
    for (let i = 0; i < inputs.length; i++) {
      if (!isFinite(inputs[i]) || inputs[i] <= 0) {
        return false;
      }
    }
    return true;
  }

  marker(activity, lat, lng) {
    const marker = L.marker([
      // coord from #mapEvent was difined in _showform
      //this.#mapEvent.latlng.lat,
      lat,
      lng,
      //this.#mapEvent.latlng.lng,
    ])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `${activity.type}-popup`,
        })
      )
      .setPopupContent(
        ` ${activity.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${this.displayDate(
          new Date()
        )}`
      )
      .openPopup();
    this.markers.push(marker);
    console.log(this.markers);
  }

  htmlInsert(activity) {
    let html = `<li class="workout workout--${
      activity.type === 'running' ? 'running' : 'cycling'
    }" data-id="${activity.id}">
     <h2 class="workout__title">${
       activity.type === 'running' ? 'Running' : 'Cycling'
     } on ${activity.month} ${activity.day}</h2>
     <div class="workout__details">
       <span class="workout__icon">${
         activity.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
       }</span>
       <span class="workout__value">${activity.distance}</span>
       <span class="workout__unit">km</span>
     </div>
     <div class="workout__details">
       <span class="workout__icon">⏱</span>
       <span class="workout__value">${activity.duration}</span>
       <span class="workout__unit">min</span>
     </div>
     <div class="workout__details">
       <span class="workout__icon">⚡️</span>
       <span class="workout__value">
        ${
          activity.type === 'running'
            ? activity.tempoRunning
            : activity.avrageSpeed
        }</span>
       <span class="workout__unit">min/km</span>
     </div>
     <div class="workout__details">
       <span class="workout__icon">${
         activity.type === 'running' ? '🦶🏼' : '⛰'
       }</span>
       <span class="workout__value">${
         activity.type === 'running' ? activity.SPM : activity.elevationGain
       }</span>
       <span class="workout__unit"> ${
         activity.type === 'running' ? 'SPM' : 'm'
       }</span>
       
     </div>
     <div class='workout_btn deleteWorkoutButton btn_hidden'>delete</div>
     <div class = 'workout_btn edit_btn btn_hidden'> edit</div>
   </li>
   `;
    form.insertAdjacentHTML('afterend', html);
  }

  _newWorkout() {
    const date = new Date();
    //let html;
    const [, month, day, year, time] = date.toString().split(' ');
    let activity;
    //input data
    const typeWorkout = inputType.value;
    const coords = [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng];
    const distance = inputDistance.value;
    const duration = inputDuration.value;
    const SPM = inputSPM.value; //running
    const elevation = +inputElevation.value; //cycling

    //is valid value

    if (
      (typeWorkout === 'running' &&
        this.isInputValid(distance, duration, SPM)) ||
      (typeWorkout === 'cycling' &&
        this.isInputValid(distance, duration, elevation))
    ) {
      this.cleanInputs();
      form.classList.add('hidden');
      if (typeWorkout === 'running') {
        activity = new running(coords, distance, duration, SPM);
        console.log(activity.idCalc());
        this.marker(
          activity,
          this.#mapEvent.latlng.lat,
          this.#mapEvent.latlng.lng
        );
        console.log(activity);
        return activity;

        // form.insertAdjacentHTML('afterend', this.htmlInsert(activity));
      }
      if (typeWorkout === 'cycling') {
        activity = new cycling(coords, distance, duration, elevation);
        this.marker(
          activity,
          this.#mapEvent.latlng.lat,
          this.#mapEvent.latlng.lng
        );
        return activity;
        // form.insertAdjacentHTML('afterend', this.htmlInsert(activity));
      }
    } else alert('wrong input my friend');
  }

  _newWorkoutFromMap(activity) {
    if (!activity) return;
    console.log(activity);
    this.htmlInsert(activity);
    this.#workouts.push(activity);
    console.log(this.#workouts);
    this._setLocalStorage();
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);
    if (!data) return;
    this.#workouts = data;
    //this.workoutss = data;
    this.#workouts.forEach(work => {
      //if (!work == null) {
      this.htmlInsert(work);
      // }
    });
  }

  // user focus on specific element
  focusOnSpecificElement(e) {
    // tu mi sie nie podoba defnicja deleteWorkoutButton
    // moze by sie to dalo gdzies lepiej zdefiniowac

    const workoutEl = e.target.closest('.workout');
    console.log(e.target);
    if (!workoutEl) return;
    const workOutPop = this.#workouts.find(e => e.id === workoutEl.dataset.id);
    form.classList.add('hidden');
    this.displayButton(workoutEl);
    this.moveToPop(workOutPop);

    workoutEl.querySelector('.deleteWorkoutButton').addEventListener(
      'click',
      function () {
        this.removeWorkoutFromLocalStorage(workOutPop.id);
      }.bind(this)
    );

    workoutEl.querySelector('.edit_btn').addEventListener(
      'click'
      // function () {
      //   this.editWorkout(workOutPop.id);
      // }.bind(this)
    );
    // deleteWorkoutButton.
  }

  // move to popup

  // reset and delete workout
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
  removeWorkoutFromLocalStorage(workoutId) {
    console.log('work');
    const workouts = JSON.parse(localStorage.getItem('workouts'));
    console.log(workouts);
    if (!workouts) return alert('puste ');

    //workouts.forEach(workout,i)=>{if (workout.id === workoutId){return }};
    const elementId = element => element.id == workoutId;
    workouts.splice(workouts.findIndex(elementId), 1);
    //if (workouts.length === 0) return localStorage.removeItem('workouts');
    //localStorage.removeItem('workouts');

    localStorage.setItem('workouts', JSON.stringify(workouts));
    this.#workouts = Object.values(workouts);
    location.reload();
  }

  // edit workout
  //removeHtmlWorkout() {}
  moveToPop(workOutPop) {
    console.log(workOutPop.id);
    this.#map.setView(workOutPop.coords, 17, {
      animate: true,
      pan: { duration: 1 },
    });
  }
  editWorkout() {}
}

const app = new App();

// const text1 =
//   'Mon Mar 27 2023 18:41:57 GMT+0200 (czas środkowoeuropejski letni)';
// console.log(text1.split(' ').splice(4, 1).toString().replace(/:/g, ''));
// console.log(text1.split(' ').slice(4, 5));
// const myFish = ['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon'];
// const removed = myFish.splice(-3, 1);
// //toString().replace(/:/g, '')
