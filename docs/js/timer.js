'use strict';

// Полифил для requestAnimationFrame
(function () {
	var lastTime = 0
	var vendors = ['ms', 'moz', 'webkit', 'o']
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
			|| window[vendors[x] + 'CancelRequestAnimationFrame']
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function (callback, element) {
			var currTime = new Date().getTime()
			var timeToCall = Math.max(0, 16 - (currTime - lastTime))
			var id = window.setTimeout(function () { callback(currTime + timeToCall) },
				timeToCall)
			lastTime = currTime + timeToCall
			return id
		}

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id)
		}
}())

// Определение с какого устройства открыта страница
const isMobile = {
	Android: function () {
		return navigator.userAgent.match(/Android/i)
	},
	BlackBerry: function () {
		return navigator.userAgent.match(/BlackBerry/i)
	},
	iOS: function () {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i)
	},
	Opera: function () {
		return navigator.userAgent.match(/Opera Mini/i)
	},
	Windows: function () {
		return navigator.userAgent.match(/IEMobile/i)
	},
	any: function () {
		return (
			isMobile.Android()
			|| isMobile.BlackBerry()
			|| isMobile.iOS()
			|| isMobile.Opera()
			|| isMobile.Windows()
		)
	}
}

// Все блоки таймера
const seconds = document.querySelector('.clock__seconds'),
	minutes = document.querySelector('.clock__minutes'),
	hours = document.querySelector('.clock__hours');


// переменная, значение которой нужно обновлять каждый раз перед запуском таймера (нужно для тиканья)
let a = Date.now()
// переменная, значение которой нужно обновлять каждый раз перед запуском таймера (нужно для отрисовки окружности, в отличие от a 
// она обновляется из функции окружности)
let c = Date.now()
// id регистрации requestAnimationFrame
let rafId1
let rafId2
// значение, указанное на таймере перед стартом startTimer (нужно для функции tickTak и timerCircle)
let timerSize


//! Функция "тиканья" таймера к нулю
a = Date.now() // время перед запуском рекурсивной функции (типа фиксированная точка отсчета)
function tickTak() {

	let b = Date.now() // текущее время на момент каждого запуска функции

	let funcAge = Math.floor((b - a) / 1000)  //время, сколько существует функция в секундах, округляем в меньшую сторону, это время будем отнимать от времени на таймере

	let diff = timerSize - funcAge   // сколько осталось на таймере в секундах

	if (diff < 0) { 		// стоп анимации по окончании времени
		hours.innerHTML = '00'
		minutes.innerHTML = '00'
		seconds.innerHTML = '00'

		cancelAnimationFrame(rafId1)
		rafId1 = null

		endTimer()

		return
	}


	let hou, min, sec;

	// вычисления для определения какие цифры показать на таймере
	hou = Math.floor(diff / 3600)
	min = Math.floor(diff / 60 - hou * 60)
	sec = diff - hou * 3600 - min * 60


	if (hou < 10) hours.innerHTML = '0' + hou
	else hours.innerHTML = hou

	if (min < 10) minutes.innerHTML = '0' + min
	else minutes.innerHTML = min

	if (sec < 10) seconds.innerHTML = '0' + sec
	else seconds.innerHTML = sec

	if (!isPaused) requestAnimationFrame(tickTak)
}

//! Анимация таймера (заполняющаяся окружность)
const canvClock = document.getElementById('canvas-clock'),
	context = canvClock.getContext('2d'),
	w = canvClock.width = canvClock.offsetWidth,
	h = canvClock.height = canvClock.offsetHeight;

let cacheFuncAge = 0  	// кэширование возраста функции на случай нажатия pause


const angleInt = Math.PI * 2 / 120  //значение угла, которое будет прибавляться каждый раз при отрисовке одной полоски
let angle = -1 / 2 * Math.PI - angleInt     // угол смещения (начало наверху окружности)

c = Date.now()
function timerCircle() {

	let b = Date.now()		// отрисовка должна срабатывать 1 раз в timersize/120 (120 - количество делений)
	let oneDegDuration = (cacheFuncAge + timerSize) / 120

	let funcAge = (b - c) / 1000 + cacheFuncAge 	 //продолжительность жизни функции в секундах
	let numDeg = funcAge / oneDegDuration   // сколько должно быть отрисовано делений на текущий момент

	if (numDeg >= 120) {
		cacheFuncAge = 0         // стоп функции по истечении времени
		cancelAnimationFrame(rafId2)
		rafId2 = null
		return
	}

	context.clearRect(0, 0, w, h) // очистка и отрисовка

	for (let i = 0; i <= numDeg; i++) {
		angle += angleInt
		drawStrip()
	}

	angle = -1 / 2 * Math.PI - angleInt // сброс угла до начального значения 

	if (isPaused) cacheFuncAge = funcAge

	if (!isPaused) requestAnimationFrame(timerCircle)
}

// Отрисовка полоски на окружности
const drawStrip = function () {
	context.fillStyle = '#D6BB74'
	context.strokeStyle = '#D6BB74'
	context.lineWidth = 1

	context.beginPath()
	context.moveTo(w / 2 + Math.cos(angle) * 139, h / 2 + Math.sin(angle) * 139)
	context.lineTo(w / 2 + Math.cos(angle) * 147, h / 2 + Math.sin(angle) * 147)
	context.fill()
	context.stroke()
	context.closePath()
}


// звуковое оповещение по окончании таймера и "мигание" фавиконки
const endTimerSound = document.querySelector('.endTimer')

const endTimer = function () {
	currentAudio.pause() // переменная из плеера
	playPauseBtn.querySelector('use').setAttribute('href', 'img/icons/symbol/sprite.svg#play') // переменная из плеера
	endTimerSound.volume = 0.5
	endTimerSound.play()
}


// Функция, которая запускает таймер, она будет запускаться при клике на кнопку Start with it
function startTimer() {
	// получаем значения из таймера
	let hoursN, minutesN, secondsN;

	if (hours.innerHTML[0] == 0) { hoursN = +hours.innerHTML[1] }
	else { hoursN = +hours.innerHTML }

	if (minutes.innerHTML[0] == 0) { minutesN = +minutes.innerHTML[1] }
	else { minutesN = +minutes.innerHTML }

	if (seconds.innerHTML[0] == 0) { secondsN = +seconds.innerHTML[1] }
	else { secondsN = +seconds.innerHTML }

	// Сумма hoursN, minutesN, secondsN - общее время, указанное на таймере в секундах
	timerSize = hoursN * 3600 + minutesN * 60 + secondsN

	// Получаем эти значения и запускаем таймер
	// if (!isPaused) {
	a = Date.now()
	rafId1 = requestAnimationFrame(tickTak)
	c = Date.now()
	rafId2 = requestAnimationFrame(timerCircle)
	// }
}

// Функция, которая берет значения из блока с настройками и помещает их в блок таймера
function handOverTimeVal() {
	let hv = +hoursWindow.innerHTML,
		mv = +minutesWindow.innerHTML,
		sv = +secondsWindow.innerHTML;

	if (hv < 10) hv = '0' + hv
	if (mv < 10) mv = '0' + mv
	if (sv < 10) sv = '0' + sv

	hours.innerHTML = hv
	minutes.innerHTML = mv
	seconds.innerHTML = sv
}





// Событие для кнопки pause/run
const pauseBtn = document.querySelector('.clock__pause')
const runBtn = document.querySelector('.clock__run')

let isPaused = true

function pauseRun() {
	pauseBtn.classList.toggle('_hidden')
	runBtn.classList.toggle('_hidden')

	if (!isPaused) isPaused = true
	else if (isPaused) {
		isPaused = false

		startTimer()

	}
}

pauseBtn.addEventListener('click', () => {
	pauseRun()
})
runBtn.addEventListener('click', pauseRun)



// Событие для кнопки Start with it
const startBtn = document.querySelector('.settings__start-button')

startBtn.addEventListener('click', function () {
	cacheFuncAge = 0
	pauseRun()
	handOverTimeVal()
	startTimer()
})




//! Задать интервал
const settingsInterval = document.querySelector('.settings__interval')

const hoursWindow = document.querySelector('.set-hours__value div span')
const minutesWindow = document.querySelector('.set-minutes__value div span')
const secondsWindow = document.querySelector('.set-seconds__value div span')

let timerId

function changeInterval(event) {
	if (event.target.closest('.set-hours__value-down')) {
		if (+hoursWindow.innerHTML != 0) {
			hoursWindow.innerHTML = +hoursWindow.innerHTML - 1
		} else if (+hoursWindow.innerHTML == 0) hoursWindow.innerHTML = 99
	}

	if (event.target.closest('.set-hours__value-up')) {
		if (+hoursWindow.innerHTML < 99) {
			hoursWindow.innerHTML = +hoursWindow.innerHTML + 1
		} else if (+hoursWindow.innerHTML === 99) hoursWindow.innerHTML = 0
	}

	if (event.target.closest('.set-minutes__value-down')) {
		if (+minutesWindow.innerHTML != 0) {
			minutesWindow.innerHTML = +minutesWindow.innerHTML - 1
		} else if (+minutesWindow.innerHTML === 0) minutesWindow.innerHTML = 59
	}

	if (event.target.closest('.set-minutes__value-up')) {
		if (+minutesWindow.innerHTML <= 58) {
			minutesWindow.innerHTML = +minutesWindow.innerHTML + 1
		} else if (+minutesWindow.innerHTML === 59) {
			minutesWindow.innerHTML = 0
		}
	}

	if (event.target.closest('.set-seconds__value-down')) {
		if (+secondsWindow.innerHTML != 0) {
			secondsWindow.innerHTML = +secondsWindow.innerHTML - 1
		} else if (+secondsWindow.innerHTML === 0) secondsWindow.innerHTML = 59
	}

	if (event.target.closest('.set-seconds__value-up')) {
		if (+secondsWindow.innerHTML <= 58) {
			secondsWindow.innerHTML = +secondsWindow.innerHTML + 1
		} else if (+secondsWindow.innerHTML === 59) {
			secondsWindow.innerHTML = 0
		}
	}
}

let isPress = false

if (!isMobile.any()) {

	settingsInterval.addEventListener('mousedown', function (event) {
		isPress = true
		if (isPress) timerId = setInterval(changeInterval, 100, event)

	})

	settingsInterval.addEventListener('mouseup', function (event) {
		isPress = false
		clearTimeout(timerId)
	})

	settingsInterval.addEventListener('mouseout', function (event) {
		isPress = false
		clearTimeout(timerId)
	})

} else if (isMobile.any()) {

	settingsInterval.addEventListener('click', function (event) {
		changeInterval(event)
	})
}









