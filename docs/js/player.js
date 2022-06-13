
'use strict';

const allAudioTitles = Array.from(document.querySelectorAll('.sounds__item-title'))
const allAudios = Array.from(document.querySelectorAll('.sounds__audio'))

const currentAudio = document.querySelector('.sounds__current-audio')

const playPauseBtn = document.querySelector('.player__play-pause')

const progStrip = document.querySelector('.progressbar__strip')
const progTodd = document.querySelector('.progressbar__toddler')
const progDot = document.querySelector('.progressbar__toddler-dot')

const progCurTime = document.querySelector('.progressbar__current-time')
const progDuration = document.querySelector('.progressbar__duration')

const volIcon = document.querySelector('.volume-icon')
const volStrip = document.querySelector('.player__volume-strip')
const volTodd = document.querySelector('.player__volume-toddler')
const volDot = document.querySelector('.volume__toddler-dot')



//Заполнение progCurTime и progDuration в начале
currentAudio.addEventListener('loadedmetadata', () => {
	progCurTime.innerHTML = '0:00'
	currentAudio.volume = .15

	let x = Math.floor(currentAudio.duration % 60)
	progDuration.innerHTML = `${Math.floor(currentAudio.duration / 60)}: 
			${x < 10 ? '0' + x : x}`
})

// Проставление длительности аудио рядом с каждым тайтлом

allAudios.forEach(el => {
	el.addEventListener('loadedmetadata', function (event) {
		let x = Math.floor(this.duration % 60)

		this.previousElementSibling.innerHTML += `<span style="white-space: nowrap"> &nbsp &nbsp(${Math.floor(this.duration / 60)}: 
			${x < 10 ? '0' + x : x})</span>`
	})
})

// Функция перемещения аудио из списка в currentAudio и включения воспроизведения
function replacement(event) {
	let src = event.currentTarget.nextElementSibling.getAttribute('src')
	currentAudio.setAttribute('src', src);
	currentAudio.play()

	if (document.querySelector('.sounds__item-title._selected')) {
		document.querySelector('.sounds__item-title._selected').classList.remove('_selected')
	}

	event.currentTarget.classList.add('_selected');

	playPauseBtn.querySelector('use').setAttribute('href', 'img/icons/symbol/sprite.svg#pause')
}

allAudioTitles.forEach(el => {
	el.addEventListener('click', replacement)
})


//! Пауза-проигрывание и изменение текущего времени проигрывания и работа с прогрессбаром

//Функция воспроизвести-запаусить при клике на кнопку play-pause (при первичном выборе трека работает не она)
function playPauseA() {

	if (!currentAudio.paused) {
		let playPromise = currentAudio.play()
		if (playPromise !== undefined) {
			playPromise.then(() => {
				currentAudio.pause()
				
				playPauseBtn.querySelector('use').setAttribute('href', 'img/icons/symbol/sprite.svg#play')
			})
		}
		return
	} else {
		currentAudio.play()
		playPauseBtn.querySelector('use').setAttribute('href', 'img/icons/symbol/sprite.svg#pause')
	}
}

playPauseBtn.addEventListener('click', playPauseA)


//функция, которая будет двигать ползунок прогресса и обновлять таймер воспроизведения при проигрывании аудио
function progPlay(event) {
	let toddLength = 100 * this.currentTime / this.duration
	progTodd.style.width = `${toddLength}%`

	let x = Math.floor(this.currentTime % 60),
		y = Math.floor(this.duration % 60);

	progCurTime.innerHTML = `${Math.floor(this.currentTime / 60)}: 
			${x < 10 ? '0' + x : x}`

	progDuration.innerHTML = `${Math.floor(this.duration / 60)}: 
			${y < 10 ? '0' + y : y}`
}

currentAudio.addEventListener('timeupdate', progPlay)



// Регулирование момента воспроизведения (управление прогрессбаром)
// Перетаскивание точки

let isGrab = false
let wasPaused = true // остановлено аудио во время события или нет

progDot.onmousedown = function (event) {
	isGrab = true

	const d = this

	const x1 = progStrip.getBoundingClientRect().left   // ширина всей полосы проигрывания
	const x2 = progStrip.getBoundingClientRect().right - 8
	const y1 = progStrip.getBoundingClientRect().top
	const y2 = progStrip.getBoundingClientRect().bottom

	if (!currentAudio.paused) { // если аудио не на паузе, то запаузить и wasPaused сделать false
		let playPromise = currentAudio.play()
		if (playPromise !== undefined) {
			playPromise.then(() => {
				currentAudio.pause()
				wasPaused = false
			})
		}
	} else wasPaused = true   // если на паузе, то wasPaused сделать true

	function dot_Mousemove_Handler(event) {

		if (isGrab) {

			let coordX = event.pageX   // где сейчас курсор мыши
			let coordY = event.clientY
			d.parentElement.style.position = 'static'

			if ((coordX > x1 && coordX < x2) && (coordY > (y1 - 15) && coordY < (y2 + 15))) {
				let wTod = (coordX - x1 + 2)
				d.style.right = (x2 - x1 - wTod) + 'px'

				d.parentElement.style.width = `${(100 * wTod / (x2 - x1))}%`
			}
		}
	}

	function dot_Mouseup_Handler(event) {
		isGrab = false

		d.removeEventListener('mousemove', dot_Mousemove_Handler)

		d.parentElement.style.position = 'relative'
		d.style.right = -8 + 'px'
		d.style.position = 'absolute'

		currentAudio.currentTime = Math.round(currentAudio.duration * (progTodd.offsetWidth / progStrip.offsetWidth))
		if (!wasPaused) currentAudio.play()
	}

	document.addEventListener('mousemove', dot_Mousemove_Handler)

	document.addEventListener('mouseup', dot_Mouseup_Handler, { 'once': true })
}

progStrip.addEventListener('click', function (event) {

	let x1 = progStrip.getBoundingClientRect().left
	let x2 = progStrip.getBoundingClientRect().right - 8

	let coord = event.pageX

	let progress = (coord - x1) / (x2 - x1)

	if (!currentAudio.paused) {

		currentAudio.pause()
		currentAudio.currentTime = Math.round(currentAudio.duration * progress)
		setTimeout(() => { currentAudio.play() }, 10)
	} else {
		currentAudio.currentTime = Math.round(currentAudio.duration * progress)
	}
})




//! Работа со звуком

// Регулирование громкости
// Перетаскивание точки прозрачного volDot
let isGrabVol = false

volDot.onmousedown = function (event) {
	isGrabVol = true

	const d = this
	// координаты всей полосы громкости
	const x1 = volStrip.getBoundingClientRect().left
	const x2 = volStrip.getBoundingClientRect().right
	const y1 = volStrip.getBoundingClientRect().top
	const y2 = volStrip.getBoundingClientRect().bottom

	function dot_Mousemove_Handler(event) {

		if (isGrabVol) {

			let coordX = event.pageX
			let coordY = event.clientY

			volTodd.style.position = 'static'  // перемещение прозрачного volDot и измениение ширины volTodd

			if ((coordX > x1 && coordX < x2) && (coordY > (y1 - 15) && coordY < (y2 + 15))) {
				let wTod = coordX - x1
				d.style.right = volStrip.offsetWidth - wTod + 'px'

				volTodd.style.width = `${Math.ceil((100 * wTod / (x2 - x1)))}%`
			}
		}
	}

	function dot_Mouseup_Handler(event) {
		isGrabVol = false

		d.removeEventListener('mousemove', dot_Mousemove_Handler)

		volTodd.style.position = 'relative'  // изменение звука и позиционирование volDot и volTodd
		d.style.right = 0 + 'px'

		let volumeVal = (volTodd.offsetWidth / volStrip.offsetWidth).toFixed(2)
		if (volumeVal < 0) volumeVal = 0

		currentAudio.volume = volumeVal > 1 ? 1 : volumeVal
	}

	document.addEventListener('mousemove', dot_Mousemove_Handler)

	document.addEventListener('mouseup', dot_Mouseup_Handler)
}

volStrip.addEventListener('click', function (event) {

	let x1 = volStrip.getBoundingClientRect().left
	let x2 = volStrip.getBoundingClientRect().right

	let coord = event.pageX

	let progress = (coord - x1) / (x2 - x1) > 1 ? 1 : (coord - x1) / (x2 - x1)

	volTodd.style.width = `${(progress * 100).toFixed(2)}%`
	volDot.style.right = 0 + 'px'

	let volumeVal = progress.toFixed(2) < 0 ? 0 : progress.toFixed(2)
	currentAudio.volume = volumeVal > 1 ? 1 : volumeVal
})


//событие изменения громкости

let cacheVol = 1 // переменная для хранения предыдущего значения громкости (нужна для работы иконки вкл/выкл звук)

currentAudio.addEventListener('volumechange', function (e) {
	if (this.volume != 0) cacheVol = this.volume
	volTodd.style.width = Math.ceil(this.volume * 100) + '%'
})


volIcon.addEventListener('click', function (e) {

	if (currentAudio.volume > 0) {
		currentAudio.volume = 0
		this.querySelector('use').setAttribute('href', 'img/icons/symbol/sprite.svg#volume-xmark')
	} else if (currentAudio.volume == 0) {
		currentAudio.volume = cacheVol
		this.querySelector('use').setAttribute('href', 'img/icons/symbol/sprite.svg#volume-high')
	}
})







