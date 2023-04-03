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
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const submitBtn = document.querySelector('.form__btn');

class workout {
  date;
  id;
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
    const [hour, minute, secound] = time.split(':');
    this.id = `${year}${months[month]}${day}${hour}${minute}${secound}`;
    console.log(this.id);
  }
}

class running extends workout {
  tempoRunning;
  constructor(coords, distance, duration, SPM) {
    super(coords, distance, duration);
    this.SPM = SPM;
    this.tempoRunningCalc();
  }
  tempoRunningCalc() {
    this.tempoRunning = this.duration / this.distance;
    return;
    Math.round(this.tempoRunning * 10) / 10;
  }
}

class cycling extends workout {
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

  constructor() {
    this._getPosition();

    submitBtn.addEventListener('click', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toogleElevationField.bind(this));
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
  }

  _showForm(e) {
    this.#mapEvent = e;
    console.log(e);
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toogleElevationField() {
    inputCadence.value = inputDistance.value = inputDuration.value = '';
  }
  //console.log('ok');
  _newWorkout() {
    const marker = L.marker([
      // coord from #mapEvent was difined in _showform
      this.#mapEvent.latlng.lat,
      this.#mapEvent.latlng.lng,
    ])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('kupa')
      .openPopup();
  }
}

const app = new App();
app;

// const text1 =
//   'Mon Mar 27 2023 18:41:57 GMT+0200 (czas środkowoeuropejski letni)';
// console.log(text1.split(' ').splice(4, 1).toString().replace(/:/g, ''));
// console.log(text1.split(' ').slice(4, 5));
// const myFish = ['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon'];
// const removed = myFish.splice(-3, 1);
// //toString().replace(/:/g, '')
