import React from 'react'
import { render } from 'react-dom'
import { setObservableConfig } from 'recompose'
import rxjsconfig from 'recompose/rxjsObservableConfig'

import App from './components/App'

setObservableConfig(rxjsconfig)
render(
  <App />,
  document.getElementById('app')
)
