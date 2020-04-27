const sourceCanvas = document.getElementById('source')
const resultCanvas = document.getElementById('result')
const video = document.getElementById('video')

const sourceCtx = sourceCanvas.getContext('2d')
const resultCtx = resultCanvas.getContext('2d')

const HEIGHT = 700

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
  navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
    video.srcObject = stream
    webcamAvailable = true
    video.play().catch((e) => {
      alert('Ah, I see, you are using a mobile (or not?). So you should touch your screen to start camera')
    })
  })
}

document.addEventListener('click', () => {
  if (webcamAvailable) {
    video.play()
  }
})

video.addEventListener('playing', () => {
  imageWidth = Math.floor(video.videoWidth * HEIGHT / video.videoHeight)
  imageHeight = HEIGHT
  updateCanvasSize()
}, false)

const processFrame = () => {
  sourceCtx.drawImage(video, 0, 0, imageWidth, imageHeight)

  const imgd = sourceCtx.getImageData(0, 0, imageWidth, imageHeight)
  const pix = imgd.data
  const n = pix.length

  for (let i = 0; i < n; i += 4) {
    const grayscale = pix[i + 3] === 0 ? 255 : pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11
    pix[i] = grayscale
    pix[i + 1] = grayscale
    pix[i + 2] = grayscale
    pix[i + 3] = 255
  }

  sourceCtx.putImageData(imgd, 0, 0)

  resultCtx.fillStyle = '#ffffff'
  resultCtx.fillRect(0, 0, imageWidth, imageHeight)

  for (let y = 0; y < 50; ++y) {
    resultCtx.beginPath()
    resultCtx.lineWidth = 2
    resultCtx.lineJoin = 'round'

    let l = 0

    for (let x = 0; x < imageWidth; ++x) {
      const c = pix[((y * imageHeight / 50 + 6) * imageWidth + x) * 4]

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
requestAnimationFrame(processFrame)