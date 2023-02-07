import Workout from './Workout.js';

export default class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // minutes/km -- change to mph later
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
