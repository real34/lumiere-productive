import firebase from 'firebase'
import {Observable} from 'rxjs'

const pomodoroEventsRef = () => firebase.database().ref().child('pomodoro_events')

const statusChanged = (newStatus) => {
  pomodoroEventsRef().push({
    event: 'statusChanged',
    payload: {
      newStatus
    },
    created: firebase.database.ServerValue.TIMESTAMP
  })
}

const currentState$ = () => {
  const statusChanges = pomodoroEventsRef()
    .orderByChild('event')
    .equalTo('statusChanged')
    .limitToLast(1)
  return Observable.fromEvent(statusChanges, 'child_added', (data) => data.val())
    .map((event) => ({
      status: event.payload.newStatus,
      since: new Date(event.created)
    }))
}

export default {
  STARTED: 'started',
  STOPPED: 'stopped',
  statusChanged,
  currentState$
}
