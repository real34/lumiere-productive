import firebase from 'firebase'
import firebaseConfig from '../src/config/firebase'

firebase.initializeApp(firebaseConfig)
const Luxafor = require("luxafor")();

const statusColors = {
  started: 'red',
  stopped: 'green',
}

console.log('starting ...')
Luxafor.init(function () {
  console.log('... initialized')
  firebase.database().ref().child('pomodoro_events')
    .orderByChild('event')
    .equalTo('statusChanged')
    .limitToLast(1)
    .on('child_added', (event) => {
      const payload = event.child('payload').val()
      if (!statusColors.hasOwnProperty(payload.newStatus)) {
        console.warn(`No color found for status "${payload.newStatus}"`)
        return
      }

      const color = statusColors[payload.newStatus]
      Luxafor.setLuxaforColor(Luxafor.colors[color], function () {
        console.log('... color changed to', color)
        Luxafor.flashColor(128, 64, 128)
      })
    })
  })
