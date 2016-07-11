const makePlaySound = (sound) => () => {
  const soundElt = new window.Audio(sound)
  soundElt.play()
}

const makeInfiniteSoundPlayer = (sound, buffer = 0.01) => {
  const soundElt = new window.Audio(sound)

  // Use the event listener over loop to prevent gaps between loops
  // see http://stackoverflow.com/a/22446616
  // soundElt.loop = true
  const loopWithoutGaps = () => {
    if (soundElt.currentTime > soundElt.duration - buffer) {
      soundElt.currentTime = 0
      soundElt.play()
    }
  }

  return {
    start: () => {
      soundElt.addEventListener('timeupdate', loopWithoutGaps, false)
      soundElt.play()
    },
    stop: () => {
      soundElt.removeEventListener('timeupdate', loopWithoutGaps, false)
      soundElt.pause()
    }
  }
}

// Sounds from https://gamesounds.xyz/
export default {
  dingDong: makePlaySound(require('file!./sounds/clong-1.wav')),
  tick: makeInfiniteSoundPlayer(require('file!./sounds/clock-ticking-3.wav'), 0.29)
}
