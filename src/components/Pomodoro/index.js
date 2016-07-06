import React from 'react'
import {Button, Container, Donut} from 'rebass'
import {createEventHandler, mapPropsStream} from 'recompose'
import {Observable} from 'rxjs'

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

const enhance = mapPropsStream((props$) => {
  const { handler: start, stream: start$ } = createEventHandler()
  const { handler: stop, stream: stop$ } = createEventHandler()

  const timeElapsed$ = start$
    .flatMap(() => Observable
      .interval(1000)
      .take(POMODORO_DURATION_IN_SEC + 1)
      .takeUntil(stop$)
    )
    .startWith(0)

  return props$.combineLatest(timeElapsed$, (props, timeElapsed) => ({
    ...props,
    timeElapsed,
    start,
    stop
  }))
})

export default enhance(Pomodoro)
