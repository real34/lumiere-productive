import React from 'react'
import {Button, Container, Donut} from 'rebass'
import {createEventHandler, mapPropsStream, compose} from 'recompose'
import {Observable} from 'rxjs'

import Sounds from './sounds.js'
import PomodoroModel from '../../models/Pomodoro.js'

const POMODORO_DURATION_IN_SEC = 25 * 60

// see http://stackoverflow.com/a/14760377
const padTimePart = (part) => ('00' + part).slice(-2)
const HumanReadableTime = ({seconds}) => {
  const minutes = Math.floor(seconds / 60)
  const secondsOfMinute = (seconds % 60)

  return <span>{padTimePart(minutes)}:{padTimePart(secondsOfMinute)}</span>
}

const Pomodoro = (props) => <div>
  <h2>Pomodoro</h2>

  <Container>
    <Donut
      color='primary'
      size={256}
      strokeWidth={32}
      value={props.timeElapsed / POMODORO_DURATION_IN_SEC}
    >
      <HumanReadableTime seconds={props.timeElapsed} />
    </Donut>
  </Container>

  <Container>
    <Button
      backgroundColor='success'
      color='white'
      pill
      rounded
      onClick={props.start}
    >
      Start
    </Button>
    <Button
      backgroundColor='error'
      color='white'
      pill
      rounded
      onClick={props.stop}
    >
      Stop
    </Button>
  </Container>
</div>

const makePomodoroTimer = (callbacks) => mapPropsStream((props$) => {
  const { handler: start, stream: start$ } = createEventHandler()
  const { handler: stop, stream: stop$ } = createEventHandler()

  const callback = (name) => callbacks.hasOwnProperty(name) ? callbacks[name] : () => ({})

  const pomodoroStart$ = start$
    .do(callback('onPomodoroStart'))
    .publishReplay(1)

  const pomodoroEnd$ = stop$
    .merge(pomodoroStart$.delay(POMODORO_DURATION_IN_SEC * 1001))
    .do(callback('onPomodoroEnd'))

  const timeElapsed$ = pomodoroStart$
    .flatMap(() => Observable
      .interval(1000)
      .takeUntil(pomodoroEnd$)
      .map((time) => time + 1)
      .do(callback('onPomodoroTick'))
    )
    .startWith(0)

  pomodoroStart$.connect()
  return props$.combineLatest(timeElapsed$, (props, timeElapsed) => ({
    ...props,
    timeElapsed,
    start,
    stop
  }))
})

const enhance = compose(
  makePomodoroTimer({
    onPomodoroStart: () => {
      PomodoroModel.statusChanged(PomodoroModel.STARTED)
      Sounds.tick.start()
    },
    onPomodoroEnd: () => {
      PomodoroModel.statusChanged(PomodoroModel.STOPPED)
      Sounds.tick.stop()
      Sounds.dingDong()
    }
  })
)

export default enhance(Pomodoro)
