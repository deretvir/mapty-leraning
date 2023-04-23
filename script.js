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
let containerWorkouts = document.querySelector('.workouts');

//inputs
const form = document.querySelector('.form');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputSPM = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//buttons
const submitBtn = document.querySelector('.form__btn');
const editBtnForm = document.querySelector('.form_edit_btn');

//sorting
const sortByTypeBtn = document.querySelector('.by_type');
const sortByDurationBtn = document.querySelector('.by_duration');
const sortByDistanceBtn = document.querySelector('.by_distance');
const sortByDateBtn = document.querySelector('.by_date');

// te zmienne bym musial do localStorage tez dac
// bo przy starcie sie resetuja na wartosci 0
let clickSortByType = 0;
let clickSortByDuration = 0;
let clickSortByDistance = 0;
let clickSortByDate = 0;

class workout {
  id;
  date;
  day;
  month;
  year;
  time;

  //                    [km]     [min]
  constructor(coords, distance, duration, date) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.date = date;
    this.idCalc();
  }
  idCalc() {
    //const date = new Date();
    const [, month, day, year, time] = this.date.split(' ');
    this.day = day;
    this.month = month;
    this.year = year;
    this.time = time;
    const [hour, minute, secound] = time.split(':');
    this.id = `${year}${months[month]}${day}${hour}${minute}${secound}`;
    return this.id;
  }
}

class running extends workout {
  type = 'running';
  tempoRunning;
  constructor(coords, distance, duration, date, SPM) {
    super(coords, distance, duration, date);
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
  constructor(coords, distance, duration, date, elevationGain) {
    super(coords, distance, duration, date);
    this.elevationGain = elevationGain;
    this.avrageSpeedCalc();
  }
  avrageSpeedCalc() {
    this.avrageSpeed = Math.round((this.distance / this.duration) * 10) / 10;
    return this.avrageSpeed;
  }
}

class App {
  #map;
  #mapEvent;
  #marker;
  #workouts = [];
  markers = [];

  lastTargetId;

  constructor() {
    this._getPosition();
    this.getLocalStorage();
    submitBtn.addEventListener('click', this._newWorkoutFromMap.bind(this));
    //deleteWorkoutButton.addEventListener('click');
    inputType.addEventListener('change', this._toogleElevationField.bind(this));
    containerWorkouts.addEventListener(
      'click',
      this.focusOnSpecificElement.bind(this)
    );
    editBtnForm.addEventListener('click', this.editWorkout.bind(this));

    sortByDateBtn.addEventListener('click', this.sortByDate.bind(this));
    sortByTypeBtn.addEventListener('click', this.sortByType.bind(this));
    sortByDurationBtn.addEventListener('click', this.sortByDuration.bind(this));
    sortByDistanceBtn.addEventListener('click', this.sortByDistance.bind(this));
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
    submitBtn.classList.remove('hidden');
    editBtnForm.classList.add('hidden');
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
      // do funkcji musza byc wrzucone wartosci lat i lng, w przeciwnym wypadku, nie dalo by sie ladowac z localStorage
      // te wartosci przede wszystkim sie generuja podczas klikniecia na mape. Ale sa tez zapisywane w klasie workout
      // i to z tej klasy pobieramy wartosci podczas ladowania z local storage
      lat,
      lng,
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
        ` ${activity.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}  ${activity.day}.${
          months[activity.month]
        }.${activity.year} ${activity.time} `
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

  _newWorkout(coords, date) {
    let activity;
    const typeWorkout = inputType.value;
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
      submitBtn.classList.add('hidden');
      // editWorkoutButton;
      if (typeWorkout === 'running') {
        activity = new running(coords, distance, duration, date, SPM);
        console.log(activity.idCalc());

        console.log(activity);
        return activity;
        // form.insertAdjacentHTML('afterend', this.htmlInsert(activity));
      }
      if (typeWorkout === 'cycling') {
        activity = new cycling(coords, distance, duration, date, elevation);
        return activity;
        // form.insertAdjacentHTML('afterend', this.htmlInsert(activity));
      }
    } else alert('wrong input my friend');
  }

  _newWorkoutFromMap() {
    let date = new Date();
    let activity = this._newWorkout(
      [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng],
      date.toString()
    );
    if (!activity) return;
    this.marker(activity, this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng);
    console.log(activity);
    this.htmlInsert(activity);
    this.#workouts.push(activity);
    console.log(this.#workouts);
    this._setLocalStorage();
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

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);
    if (!data) return;
    this.#workouts = data;

    this.#workouts.forEach((work, i) => {
      this.htmlInsert(work);
    });
  }

  // user focus on specific element
  focusOnSpecificElement(e) {
    // tu mi sie nie podoba defnicja deleteWorkoutButton
    // moze by sie to dalo gdzies lepiej zdefiniowac

    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    this.lastTargetId = workoutEl.dataset.id;
    console.log(this.lastTargetId);
    const workOutPop = this.#workouts.find(e => e.id === workoutEl.dataset.id);

    if (e.target !== workoutEl.querySelector('.edit_btn')) {
      form.classList.add('hidden');
    }
    this.displayButton(workoutEl);
    this.moveToPop(workOutPop);

    workoutEl.querySelector('.deleteWorkoutButton').addEventListener(
      'click',
      function () {
        this.removeWorkoutFromLocalStorage(workOutPop.id);
      }.bind(this)
    );

    workoutEl.querySelector('.edit_btn').addEventListener('click', function () {
      //console.log('ok');
      form.classList.remove('hidden');
      editBtnForm.classList.remove('hidden');
      submitBtn.classList.add('hidden');
      inputDistance.focus();
    });
  }
  moveToPop(workOutPop) {
    //console.log(workOutPop.id);
    this.#map.setView(workOutPop.coords, 17, {
      animate: true,
      pan: { duration: 1 },
    });
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

  editWorkout() {
    const workoutIdToReplace = this.#workouts.findIndex(
      e => e.id === this.lastTargetId
    );

    console.log(
      this.#workouts[workoutIdToReplace].coords,
      this.#workouts[workoutIdToReplace].date
    );

    let changedActivity = this._newWorkout(
      this.#workouts[workoutIdToReplace].coords,
      this.#workouts[workoutIdToReplace].date
    );
    console.log(changedActivity);
    this.#workouts[workoutIdToReplace] = changedActivity;
    this._setLocalStorage();
    location.reload();
  }

  //sorting
  sortedLi(resultId) {
    const liWorkouts = containerWorkouts.querySelectorAll('li');
    const liWorkoutsNew = [];
    for (let i = 0; i < resultId.length; i++) {
      for (let j = 0; j < resultId.length; j++) {
        if (resultId[i] === liWorkouts[j].getAttribute('data-id')) {
          // console.log('true');
          liWorkoutsNew.push(liWorkouts[j]);
        }
      }
    }
    //ciekawe usuniecie elementow tylko Li z ul. Bez tego wszytkie queryselctor
    // na form by nie dzialaly
    liWorkouts.forEach(li => li.remove());
    liWorkoutsNew.forEach(e => containerWorkouts.appendChild(e));
    console.log(containerWorkouts);
  }
  sortByType() {
    //  const clicks=0;
    // const OldUl =
    const runningArray = [];
    const cyclingArray = [];
    const runningIdArray = [];
    const cyclingIdArray = [];
    let resultId = [];

    this.#workouts.forEach(e => {
      if (e.type === 'running') {
        runningArray.push(e);
        runningIdArray.push(e.id);
      } else {
        cyclingArray.push(e);
        cyclingIdArray.push(e.id);
      }
    });

    if (clickSortByType % 2 === 0) {
      this.#workouts = runningArray.concat(cyclingArray);
      resultId = runningIdArray.concat(cyclingIdArray);
    }
    if (clickSortByType % 2 !== 0) {
      this.#workouts = cyclingArray.concat(runningArray);
      resultId = cyclingIdArray.concat(runningIdArray);
    }
    this.sortedLi(resultId.reverse());
    this._setLocalStorage();
    clickSortByType++;
  }

  sortByDuration() {
    let resultId = [];
    if (clickSortByDuration % 2 === 0) {
      // mozna tez uzyc
      //this.#workouts.sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration));
      this.#workouts = this.sortMinMax(this.#workouts, 'duration');
    } else this.#workouts = this.sortMaxMin(this.#workouts, 'duration');
    this.#workouts.forEach(e => resultId.push(e.id));
    this.sortedLi(resultId.reverse());
    //this._setLocalStorage();
    clickSortByDuration++;
    //   this.#workouts = sortedArray;
  }
  sortByDistance() {
    let resultId = [];
    if (clickSortByDistance % 2 === 0) {
      this.#workouts.sort(
        (a, b) => parseFloat(a.distance) - parseFloat(b.duration)
      );
      //this.#workouts = this.sortMinMax(this.#workouts, 'distance');
    }
    //this.#workouts = this.sortMaxMin(this.#workouts, 'distance');
    else
      this.#workouts.sort(
        (a, b) => parseFloat(b.distance) - parseFloat(a.duration)
      );
    this.#workouts.forEach(e => resultId.push(e.id));
    this.sortedLi(resultId.reverse());
    this._setLocalStorage();
    clickSortByDistance++;
    //   this.#workouts = sortedArray;
  }

  sortByDate() {
    let resultId = [];
    if (clickSortByDate % 2 === 0) {
      this.#workouts.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    //this.#workouts = this.sortMaxMin(this.#workouts, 'distance');
    else this.#workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    this.#workouts.forEach(e => resultId.push(e.id));
    this.sortedLi(resultId.reverse());
    this._setLocalStorage();
    clickSortByDate++;
  }

  //te funkcje sortMinMax i sortMaxMin nie sa potrzebne
  sortMinMax(arr1, duration) {
    let x = duration;
    for (let i = 0; i < arr1.length; i++) {
      let swap = false;
      let minIndex = i;
      for (let j = i + 1; j < arr1.length; j++) {
        if (arr1[j][x] < arr1[minIndex][x]) {
          minIndex = j;
          swap = true;
        }
      }
      if (swap) {
        let temp = arr1[i];
        arr1[i] = arr1[minIndex];
        arr1[minIndex] = temp;
      } else {
        // Array is already sorted
        break;
      }
    }
    return arr1;
  }
  sortMaxMin(arr1, duration) {
    let x = duration;
    for (let i = 0; i < arr1.length; i++) {
      let swap = false;
      let minIndex = i;
      for (let j = i + 1; j < arr1.length; j++) {
        if (arr1[j][x] > arr1[minIndex][x]) {
          minIndex = j;
          swap = true;
        }
      }
      if (swap) {
        let temp = arr1[i];
        arr1[i] = arr1[minIndex];
        arr1[minIndex] = temp;
      } else {
        // Array is already sorted
        break;
      }
    }
    return arr1;
  }
  //removeHtmlWorkout() {}
}

const app = new App();

// powtorzylem dom traversing, array.sort(); usuwanie(liWorkouts.foreach(e=>e.remove)), dodawanie elementow do ul appendChild();
// css grid
// array.splice()
//
