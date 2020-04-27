const sourceCanvas = document.getElementById('source')
const resultCanvas = document.getElementById('result')
const video = document.getElementById('video')

const sourceCtx = sourceCanvas.getContext('2d')
const resultCtx = resultCanvas.getContext('2d')

const HEIGHT = 750

let imageWidth = 5
let imageHeight = 5

const updateCanvasSize = () => {
  video.width = imageWidth
  video.height = imageHeight
  sourceCanvas.width = imageWidth
  sourceCanvas.height = imageHeight
  resultCanvas.width = imageWidth
  resultCanvas.height = imageHeight
}

const decel = (x) => 1 - (x - 1) * (x - 1) // easing

let webcamAvailable = false

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({video: true}).then(async (stream) => {
    video.srcObject = stream
    webcamAvailable = true
    await video.play()
      .then(start)
      .catch((e) => {
        alert('Ah, I see, you are using a mobile (or not?). So you should touch your screen to start camera')
      })
  })
}

document.addEventListener('click', async () => {
  if (webcamAvailable) {
    await video.play()
    start()
  }
})

video.addEventListener('playing', () => {
  imageWidth = Math.floor(video.videoWidth * HEIGHT / video.videoHeight)
  imageHeight = HEIGHT
  updateCanvasSize()
}, false)

const processFrame = () => {
  const start = Date.now()
  sourceCtx.drawImage(video, 0, 0, imageWidth, imageHeight)

  const imgd = sourceCtx.getImageData(0, 0, imageWidth, imageHeight)
  const pix = imgd.data

  const h1 = HEIGHT / 50

  resultCtx.fillStyle = '#ffffff'
  resultCtx.lineWidth = 2
  resultCtx.lineJoin = 'round'

  for (let y = 0; y < 50; ++y) {
    resultCtx.fillRect(0, h1 * y, imageWidth, h1 * (y + 1))

    resultCtx.beginPath()

    let l = 0

    for (let x = 0; x < imageWidth; ++x) {
      const i = ((y * imageHeight / 50 + 6) * imageWidth + x) * 4
      const c = pix[i + 3] === 0 ? 255 : pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11

      l += (255 - c) / 255

      const m = (255 - c) / 255

      resultCtx.lineTo(
        x,
        (y + 0.5) * imageHeight / 50 + Math.sin(l * Math.PI / 2) * 5 * decel(m)
      )
    }
    resultCtx.stroke()
  }

  document.getElementById('fps').textContent = (1000 / (Date.now() - start)).toString()

  requestAnimationFrame(processFrame)
}

const start = () => requestAnimationFrame(processFrame)
