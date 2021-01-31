(function () {
  'use strict'

  var wavesurfer
  var playing
  var audios

  var header = {
    init () {
      var ham = document.querySelector('.nav--hamburger')
      var nav = document.querySelector('header nav')

      if (!ham) return

      ham.addEventListener('click', function () {
        if (!nav) return
        nav.classList.toggle('open')
        nav.blur()
      })
    }
  }

  var footer = {
    init () {
      var ls = document.querySelector('section:last-of-type')
      var sc

      if (!ls) return
      ls.getAttribute('class').trim().split(' ')
        .forEach(function (c) {
          if (['highlight', 'focus', 'invert', 'black'].includes(c)) {
            sc = c
          }
        })

      if (!sc) return
      document.body.classList.add(sc)
    }
  }

  var download = {
    init() {
      var units = ['KB', 'MB', 'GB']
      var els = document.querySelectorAll('a.download .download--size')

      els.forEach(function (el) {
        var thousands = -1
        var bytes = parseFloat(el.getAttribute('data-bytes'))

        while (bytes > 1000) {
          bytes /= 1024
          thousands++
        }

        el.innerHTML = bytes.toFixed(1) + ' ' + units[thousands]
      })
    }
  }

  var audioPlayer = {
    init () {
      var libLoaded = window.setInterval(function () {
        if (window.WaveSurfer) {
          window.clearInterval(libLoaded)

          wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: 'rgba(255,255,255, .35)',
            progressColor: '#83cacc',
            cursorColor: '#FAB700',
            responsive: true,
            barWidth: 2,
            height: 40,
            barHeight: 2
          })

          wavesurfer.on('loading', function (percent) {
            var player = document.querySelector('#player')
            var playerLoading = document.querySelector('#player .player--loading')

            player.classList.add('loading')
            playerLoading.innerText = `Loading sound ${percent}% `

            if (percent === 100) {
              playerLoading.innerText = 'Loading waveform...'
            }
          })

          wavesurfer.on('ready', function () {
            var player = document.querySelector('#player')
            var playerLoading = document.querySelector('#player .player--loading')

            playerLoading.innerText = ''
            player.classList.remove('loading')

            wavesurfer.play()
          })

          wavesurfer.on('finish', function () {
            var play = document.querySelectorAll('.play')
            for (var i = 0; i < play.length; i++) {
              play[i].classList.remove('playing')
            }
          })
        }
      }, 500)

      var player = document.querySelector('#player')
      var playerPlay = document.querySelector('#player .play')
      var trackInfo = document.querySelector('#player .player--meta')

      var play = function ({ target, audio, title, detail }) {
        var play = document.querySelectorAll('.play')
        var metaData = audios[audio]

        if (metaData) {
          var url = metaData.url
          var defaultTitle = audios[audio].title
          var defaultDetail = audios[audio].detail
        } else {
          var url = '/audio/' + audio + '.ogg'
        }

        player.classList.add('open')

        trackInfo.querySelector('h5').innerText = title || defaultTitle
        trackInfo.querySelector('p').innerText = detail || defaultDetail

        if (target.classList.contains('playing')) {
          wavesurfer.pause()
        } else if (playing === audio) {
          wavesurfer.play()
        } else {
          for (var i = 0; i < play.length; i++) {
            play[i].classList.remove('playing')
          }
          wavesurfer.stop()
          wavesurfer.load(url)
          playing = audio
        }

        target.classList.toggle('playing')
        playerPlay.classList.toggle('playing')
      }

      window.addEventListener('play', function (event) {
        var target = event.detail.target === playerPlay
          ? document.querySelector('.play[data-audio="' +playing+'"]')
          : event.detail.target

        var audio = event.detail.audio || playing
        var title = event.detail.title
        var detail = event.detail.detail

        if (!audio) {
          return
        }

        if (!audios) {
          fetch('/_catalogue/a.json')
            .then(function (response) { return response.json() })
            .then(function (json) {
              audios = json
              play({ player, target, audio, title, detail })
            })
        } else {
          play({ target, audio, title, detail })
        }
      })

      var close = document.querySelector('.player--close')

      close.addEventListener('click', function (event) {
        wavesurfer.stop()
        player.classList.remove('open')

        var play = document.querySelectorAll('.play')
        for (var i = 0; i < play.length; i++) {
          play[i].classList.remove('playing')
        }
      })
    }
  }

  var slider = {
    init() {
      var sliders = document.querySelectorAll('.slider')
      sliders.forEach(function(slider) {
        var toggle = slider.querySelector('.slider--fullscreen-toggle')
        var section = slider
        var i = 0;

        while (section.tagName.toLowerCase() !== 'section' && i < 20) {
          section = section.parentNode
          i++
        }

        toggle.addEventListener('click', function() {
          slider.classList.toggle('fullscreen')
          section.classList.toggle('fullscreen-slider')
          document.body.classList.toggle('blocked')
        })
      })
    }
  }

  header.init()
  footer.init()
  download.init()
  audioPlayer.init()
  slider.init()

})(window)