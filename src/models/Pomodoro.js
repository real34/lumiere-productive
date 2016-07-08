import firebase from 'firebase'

const statusChanged = (newStatus) => {
  firebase.database().ref().child('pomodoro_events').push({
    event: 'statusChanged',
    payload: {
      newStatus
    },
    created: firebase.database.ServerValue.TIMESTAMP
  })
}

export default {
  STARTED: 'started',
  STOPPED: 'stopped',
  statusChanged
}
