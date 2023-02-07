import Workout from './Workout';

export default class WeightLifting extends Workout {
  type = 'weight_lifting';
  constructor(coords, duration, reps, sets) {
    super(coords, duration);
    this.reps = reps;
    this.sets = sets;
  }
}
