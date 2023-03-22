'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const submitBtn = document.querySelector('.form__btn');

let map, mapEvent;

function temporaryMarker() {
  const marker = L.marker([mapEvent.latlng.lat, mapEvent.latlng.lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        autoClose: true,
        closeOnClick: true,
        className: 'running-popup',
      }).close()
    );
}

function workoutWindow() {
  form.classList.remove('hidden');
  inputDistance.focus();
}

(function getLocation() {
 

      map.on('click', function (e) {
        mapEvent = e;
        console.log(e);
        temporaryMarker();
        workoutWindow();
      });
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
})();
//getLocation();

submitBtn.addEventListener('click', function () {
  console.log(mapEvent);
  const marker = L.marker([mapEvent.latlng.lat, mapEvent.latlng.lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('kupa')
    .openPopup();
  console.log('cliclCoords', mapEvent.latlng.lat, mapEvent.latlng.lng);
});

inputType.addEventListener('change', function () {
  inputCadence.value = inputDistance.value = inputDuration.value = '';
});
