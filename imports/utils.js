export function removeRandomElementFromArray(array) {
  return array.splice(Math.floor(array.length * Math.random()),1)[0]; //one liner ahoy
}