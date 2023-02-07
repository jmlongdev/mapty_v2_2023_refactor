export default class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10); //let a library create ID
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  // Gives workout and date information for marker
  _setDescription() {
    // prettier-ignore
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    // prettier-ignore
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
  // click() {
  //   this.clicks++;
  // }
}
