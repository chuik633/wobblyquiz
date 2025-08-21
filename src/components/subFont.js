import * as d3 from 'd3'
import p5 from 'p5'
const letterImgFolder = './letterImages3/'
const minFontSize = 8

function replaceHandwriting(p, text, fontSize, spacing, node, animate) {
  // defaults
  let width = 100
  let height = fontSize + 5
  let letterW = fontSize
  let letterH = fontSize

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const letterImages = {}
  p.setup = async () => {
    for (const letter of alphabet) {
      const l1 = await p.loadImage(letterImgFolder + `${letter}.png`)
      const l2 = await p.loadImage(letterImgFolder + `${letter}-1.png`)
      letterImages[letter] = [l1, l2]
    }
    width = node.getBoundingClientRect().width
    if (width / text.length < minFontSize) {
      width = minFontSize * text.length
    }
    height = Math.max(node.getBoundingClientRect().height, fontSize)
    console.log(node, 'creating canas with width height:', width, height)
    const canvas = p.createCanvas(width, height, p.P2D).parent(node)
    canvas.position(0, 0)
    p.clear()
    canvas
      .style('position', 'absolute !important')
      .style('top', '0px !important')
      .style('left', '0px !important')
    p.textFont('Cutive Mono')

    const testLetterImg = letterImages['a'][0]
    const letterApsect = 101 / 151
    letterW = fontSize * letterApsect
    const maxLetterW = width / text.length
    letterW = Math.min(letterW, maxLetterW)
    letterH = letterW / letterApsect

    console.log('letter size', letterW, 'height', letterH, 'aspect', letterApsect)

    drawText(0)
  }
  p.draw = () => {
    p.clear()

    if (animate) {
      if (p.frameCount % 50 < 25) {
        drawText(0)
      } else {
        drawText(1)
      }
    } else {
      drawText(0)
    }
  }
  function drawText(num) {
    for (let i = 0; i < text.length; i++) {
      const x = i * (letterW + spacing)
      const y = 0
      const letter = text[i]

      if (Object.keys(letterImages).includes(letter)) {
        // const letterImg = letterImages[letter][num]
        // const aspectRatio = letterImg.width / letterImg.height
        // const w = fontSize * aspectRatio
        const pdist = p.dist(p.mouseX, p.mouseY, x, y)
        if (pdist < letterW * 3) {
          p.fill('black')
          p.textSize(fontSize)
          // p.image(letterImages[letter][1], x, y, letterW, letterH)
          p.text(letter, x, y + letterW)
        } else {
          p.image(letterImages[letter][num], x, y, letterW, letterH)
        }
      }
    }
  }
}

export function replaceAllHandwritting() {
  const handWritingDivs = d3.selectAll('.handwritten')
  handWritingDivs.selectAll('canvas').remove()
  handWritingDivs.style('color', 'rgba(255, 255, 255, 0)').style('position', 'relative')
  for (const elem of handWritingDivs) {
    const elementText = d3.select(elem).text().toLowerCase()
    const fontSize = parseInt(d3.select(elem).style('font-size').slice(0, -2))
    let spacing = d3.select(elem).style('letter-spacing')
    const animate = d3.select(elem).node().classList.contains('animated')

    if (spacing == 'normal') {
      spacing = 0
    } else {
      spacing = parseInt(spacing.slice(0, -2))
    }
    console.log('text', elementText, 'animated', animate, 'spacing', spacing)
    new p5((p) =>
      replaceHandwriting(p, elementText, fontSize, spacing, d3.select(elem).node(), animate),
    )
  }
  d3.selectAll('.handwritten canvas')
    .style('position', 'absolute !important')
    .style('top', '0px !important')
    .style('left', '0px !important')
}
