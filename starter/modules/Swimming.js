import Workout from './Workout.js';

export default class Swimming extends Workout {
  type = 'swimming';
  constructor(coords, distance, duration, laps) {
    super(coords, distance, duration);
    this.laps = laps;
    this._calcLapPace();
    this._setDescription();
  }

  _calcLapPace() {
    this.pace = (this.distance / 50 / this.duration) * 60;
  }
}
