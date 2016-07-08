import React from 'react'
import { render } from 'react-dom'
import firebase from 'firebase'
import { setObservableConfig } from 'recompose'
import rxjsConfig from 'recompose/rxjsObservableConfig'

import firebaseConfig from './config/firebase'
import App from './components/App'

firebase.initializeApp(firebaseConfig)
setObservableConfig(rxjsConfig)

render(
  <App />,
  document.getElementById('app')
)
