<template>
  <div class="game-container" ref="sketchContainer">
    <h2 class="instructions">Memorize the blind boxes, then press go!</h2>
    <div class="canvas-container"></div>
    <div class="btn-container"></div>
  </div>
</template>
<style>
h2.instructions {
  text-align: center;
  font-size: 15px;
  max-width: 200px;
}
.game-container {
  padding: 80px 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.btn-container {
  width: 100%;
  height: fit-content;
  min-height: 50px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
}
button {
  text-transform: uppercase !important;
}
#boxgame-btn {
  background-color: var(--green-lime) !important;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import p5 from 'p5'
const emit = defineEmits(['submit'])

const sketchContainer = ref(null)
let sketchInstance

const width = window.innerWidth - 50
const height = Math.max(width / 3, 150)

const numBoxes = 4
const gap = 0
const boxW = (width - gap * (numBoxes + 1)) / numBoxes
let secretBox
let boxes = []

const animationLength = 4000
const numSwitches = 5
const animationSwitchLength = animationLength / (numSwitches + 1)
let animationStart
let allowClick = false

let numTries = 0
let success = false

onMounted(() => {
  sketchInstance = new p5((p) => {
    const imgPathBase = '/blindBoxes/'
    const images = {
      box_top_0: '',
      box_top_1: '',
      box_top_2: '',
      box: '',
      potato_0: '',
      potato_1: '',
      potato_2: '',
      potato_special: '',
    }
    p.preload = () => {
      for (const imgName of Object.keys(images)) {
        images[imgName] = p.loadImage(imgPathBase + imgName + '.png')
      }
    }
    p.setup = () => {
      const parentNode = d3.select('.canvas-container').node()
      const canvas = p.createCanvas(width, height).parent(parentNode)
      // canvas
      setupBoxes(p)
    }

    p.draw = () => {
      drawGame(p)
    }

    p.mousePressed = () => {
      handleMousePressed(p)
    }
    function drawGame(p) {
      p.clear()
      if (animationStart) {
        const elapsed = p.millis() - animationStart
        const switchNum = Math.floor(elapsed / animationSwitchLength)

        if (switchNum == numSwitches - 1) {
          animationStart = undefined
          allowClick = true
          d3.select('.instructions').text('Select the correct blind box!')
        } else {
          const switchElapsed = elapsed - switchNum * animationSwitchLength
          const switchProgress = (switchElapsed % animationSwitchLength) / animationSwitchLength

          for (const box of boxes) {
            const startx = box.xSwitches[switchNum]
            const endx = box.xSwitches[switchNum + 1]
            box.x = p.lerp(startx, endx, easeInOutQuad(switchProgress))
          }
        }
      }
      for (const box of boxes) {
        drawBox(p, box)
      }
    }
    function drawBox(p, box) {
      p.fill(box.secret ? 'black' : 'white')
      p.image(images['box'], box.x, box.y, boxW, boxW)
      p.image(images['box_top_' + box.openState], box.x, box.y, boxW, boxW)
      if (box.openState == 0) {
        if (box.secret) {
          p.image(images['potato_special'], box.x, box.y, boxW, boxW)
        } else {
          p.image(images['potato_' + (box.i % 3)], box.x, box.y, boxW, boxW)
        }
      }
    }
  }, sketchContainer.value)

  const container = d3.select('.game-container')

  const buttonContainer = d3.select('.btn-container')

  buttonContainer
    .append('button')
    .attr('id', 'boxgame-btn')
    .style('visibility', 'visible')
    .text('GO!')
    .on('click', () => {
      if (!success) {
        startShuffling()
        hideBtn(d3.select('#boxgame-btn'))
      }
    })

  const submitBtn = buttonContainer
    .append('button')
    .attr('id', 'submit-btn')
    .text('Next Question')
    .on('click', () => {
      console.log('next question trigger')
      console.log('tries:', numTries, success)
      let output = ''
      if (success) {
        output = 'success'
      } else {
        output = 'fail'
      }
      if (numTries == 0) {
        output += '0'
      } else if (numTries < 3) {
        output += '1'
      } else {
        output += 'persis2tent'
      }
      emit('submit', output)
    })
  hideBtn(submitBtn)
})

function hideBtn(btn) {
  btn.style('visibility', 'hidden').style('width', '0px').style('padding', '0px')
}
function showBtn(btn) {
  btn.style('visibility', 'visible').style('width', 'fit-content').style('padding', '10px')
}
onUnmounted(() => {
  if (sketchInstance) sketchInstance.remove()
})

function setupBoxes(p) {
  secretBox = Math.floor(p.random(numBoxes))
  const boxNumbers = Array.from({ length: numBoxes }, (_, i) => i)
  let boxSorts = []
  for (let i = 0; i < numSwitches + 1; i++) {
    boxSorts.push([...boxNumbers].sort(() => Math.random() - 0.5))
  }

  const xScale = (index) => gap + index * (boxW + gap)
  let x = gap
  for (let i = 0; i < numBoxes; i++) {
    boxes.push({
      i: i,
      x: x,
      y: height / 3,
      openState: 0,
      startx: x,
      starty: height / 2,
      xSwitches: boxSorts.map((switchList) => xScale(switchList[i])),
      secret: i == secretBox,
    })
    x += boxW + gap
  }
}

function handleMousePressed(p) {
  if (!allowClick) {
    return
  }
  if (!animationStart) {
    //selecting the box
    let clickedBox = boxes.find(
      (box) =>
        p.mouseX >= box.x &&
        p.mouseX <= box.x + boxW &&
        p.mouseY >= box.y &&
        p.mouseY <= box.y + boxW,
    )

    if (clickedBox) {
      allowClick = false
      openBox(clickedBox)
      if (clickedBox.i == secretBox) {
        success = true
        d3.select('.instructions').text('Correct!')
        showBtn(d3.select('#submit-btn'))
        d3.select('#submit-btn').text('Next question!')
      } else {
        d3.select('.instructions').text('Incorrect!')
        showBtn(d3.select('#submit-btn'))
        showBtn(d3.select('#boxgame-btn'))
        d3.select('#boxgame-btn').text('Try Again?')
        d3.select('#submit-btn').text('Give up')
      }
    }
  }
}

function openBox(box) {
  box.openState = 1
  setTimeout(() => {
    box.openState = 0
  }, 50)
}
function closeBox(box) {
  box.openState = 1
  setTimeout(() => {
    box.openState = 2
  }, 50)
}

function startShuffling() {
  boxes.forEach((box) => closeBox(box))
  allowClick = false
  animationStart = sketchInstance.millis()
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
</script>
