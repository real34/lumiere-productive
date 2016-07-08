# lumiere-productive

Luxafor driven productivity

## Install

* Run `make install`
* Copy `src/config/firebase.js.dist` to `src/config/firebase.js` and change your credentials

## Usage

Run `docker-compose run --rm npm start` to start the web application
From there you can manage your Pomodoro timer

Then run `docker-compose run --rm luxafor_agent` to start an agent to control
your luxafor device from events pushed to Firebase by the wab application
