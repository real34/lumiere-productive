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

const StartButton = ({onStart}) => <Button
  backgroundColor='success'
  color='white'
  pill
  rounded
  onClick={onStart}
>
  Start
</Button>

const StopButton = ({onStop}) => <Button
  backgroundColor='error'
  color='white'
  pill
  rounded
  onClick={onStop}
>
  Stop
</Button>

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
    {
      props.isRunning
      ? <StopButton onStop={props.stop} />
      : <StartButton onStart={props.start} />
    }
  </Container>
</div>

const makePomodoroTimer = (callbacks) => mapPropsStream((props$) => {
  const { handler: start, stream: start$ } = createEventHandler()
  const { handler: stop, stream: stop$ } = createEventHandler()

  const callback = (name) => callbacks.hasOwnProperty(name) ? callbacks[name] : () => ({})

  const pomodoroStart$ = start$
    .map(() => new Date())
    .do(callback('onPomodoroStart'))
    .merge(props$
      .filter(({pomodoroState}) => pomodoroState.status === PomodoroModel.STARTED)
      .map(({pomodoroState}) => pomodoroState.since)
    )
    .distinctUntilChanged()
    .publishReplay(1)

  const pomodoroEnd$ = stop$
    .merge(pomodoroStart$.delayWhen(
      (startedAt) => Observable.of(startedAt).delay(
        new Date(startedAt.getTime() + POMODORO_DURATION_IN_SEC * 1000)
      )
    ))
    .do(callback('onPomodoroEnd'))
    .merge(props$.filter(
      ({pomodoroState}) => pomodoroState.status === PomodoroModel.STOPPED
    ))

  const timeElapsed$ = pomodoroStart$
    .map((startedAt) => Math.floor((Date.now() - startedAt.getTime()) / 1000))
    .flatMap((offsetInSeconds) => Observable
      .interval(1000)
      .takeUntil(pomodoroEnd$)
      .map((time) => time + offsetInSeconds)
      .do(callback('onPomodoroTick'))
    )
    .startWith(0)

  const isRunning$ = Observable.merge(
    pomodoroStart$.mapTo(true),
    pomodoroEnd$.mapTo(false)
  ).startWith(false)

  pomodoroStart$.connect()
  return props$.combineLatest(
    timeElapsed$, isRunning$,
    (props, timeElapsed, isRunning) => ({
      ...props,
      timeElapsed,
      isRunning,
      start,
      stop
    })
  )
})

const enhance = compose(
  mapPropsStream((props$) => props$.combineLatest(
    PomodoroModel.currentState$(),
    (props, pomodoroState) => ({
      ...props,
      pomodoroState
    })
  )),
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
