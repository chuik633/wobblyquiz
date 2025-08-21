import * as d3 from 'd3'
import p5 from 'p5'
import fontUrl from '@/assets/fonts/Fredoka-SemiBold.ttf?url'
import fontUrl2 from '@/assets/fonts/IBMPlexMono-SemiBold.ttf?url'
function wobblyFont(
  p,
  text,
  fontSize,
  fontColor,
  letterSpacing = 1,
  outline = false,
  animateOnHover = false,
  node,
) {
  const textLength = text.length
  const textWidth = textLength * (fontSize + letterSpacing)
  const textHeight = fontSize * 2
  let centerY
  let font
  let animate = false
  p.preload = () => {
    font = p.loadFont(fontUrl2)
  }

  p.setup = () => {
    const canvas = p.createCanvas(textWidth, textHeight, p.P2D).parent(node)
    canvas.position(0, 0)
    centerY = textHeight / 2

    p.textFont(font)
    fontMaker(text, p.frameCount)
  }

  p.draw = () => {
    p.clear()
    if (animateOnHover) {
      if (p.mouseX < textWidth && p.mouseX > 0 && p.mouseY < textHeight && p.mouseY > 0) {
        animate = true
      } else {
        animate = false
      }
    } else {
      animate = true
    }

    fontMaker(text, p.frameCount)
  }
  function fontMaker(inputText, frameCount) {
    let x, y
    const letters = inputText.split('')
    let squishedFontSize = fontSize
    let w = letters.length * squishedFontSize
    x = textWidth / 2 - w / 2
    x = 0

    y = centerY

    let i = 0
    for (const letter of letters) {
      if (letter == ' ') {
        x += fontSize
        continue
      }
      if (Array.isArray(fontColor)) {
        p.fill(fontColor[i % fontColor.length])
        i++
      } else {
        p.fill(fontColor)
      }

      if (outline == false) {
        p.noStroke()
      } else {
        p.stroke(outline)
      }

      p.textSize(squishedFontSize)
      let points = font.textToPoints(
        letter,
        x, // x
        y, // y
        squishedFontSize, // fontsize
        { sampleFactor: 0.5 },
      )

      let formattedPoints = []
      let maxX = Math.max(...points.map((e) => e.x))
      for (let e of points) {
        formattedPoints.push([e.x, e.y])
      }
      if (animate) {
        noiseToShape(formattedPoints, frameCount)
      } else {
        noiseToShape(formattedPoints, 0)
      }

      x += fontSize
      x = maxX + letterSpacing
    }
  }
  function noiseToShape(points, timeStamp) {
    function y_line(point1, point2, input_x) {
      //y=mx + b
      let [x1, y1] = point1
      let [x2, y2] = point2
      if (x2 === x1) return (y1 + y2) / 2
      let m = (y2 - y1) / (x2 - x1)

      let output_y = m * (input_x - x1) + y1
      return output_y
    }

    function add_points(points) {
      var newPoints = []
      for (let i = 0; i < points.length; i++) {
        let nextPointIdx = (i + 1) % points.length
        let nextPoint = points[nextPointIdx]
        let currPoint = points[i]
        let midpoint_x = (currPoint[0] + nextPoint[0]) / 2
        let midpoint_y = y_line(currPoint, nextPoint, midpoint_x)

        newPoints.push(currPoint)
        newPoints.push([midpoint_x, midpoint_y])
      }
      return newPoints
    }

    const numIters = 4 // number of interpolation iterations
    for (let i = 0; i < numIters; i++) {
      points = add_points(points)
    }

    const noiseZoom = 0.4
    const noiseLevel = fontSize / 15

    const animationSpeed = 0.1

    p.beginShape()
    for (let i = 0; i < points.length; i++) {
      let x = points[i][0]
      let y = points[i][1]
      let n = p.noise(x * noiseZoom, y * noiseZoom, timeStamp * animationSpeed) * noiseLevel

      // p.fill('black')
      // p.ellipse(x + n, y + n, 1, 1)
      // p.noFill()
      p.vertex(x + n, y + n)
    }
    p.endShape(p.CLOSE)
  }
}

export function replaceAllWiggly() {
  const handWritingDivs = d3.selectAll('.wiggly')
  // handWritingDivs.style('position', 'relative')
  for (const elem of handWritingDivs) {
    const elementText = d3.select(elem).text()
    const fontSize = parseInt(d3.select(elem).style('font-size').slice(0, -2))
    let spacing = d3.select(elem).style('letter-spacing')

    if (spacing == 'normal') {
      spacing = 0
    } else {
      spacing = parseInt(spacing.slice(0, -2))
    }

    const colorful = d3.select(elem).node().classList.contains('colorful')
    let colorVal = d3.select(elem).style('color')

    if (colorVal.includes('var')) {
      colorVal = d3.select(':root').style(colorVal.substring(4, colorVal.length - 1))
    }
    console.log('color', colorVal)
    if (colorful) {
      colorVal = ['#D5402C', '#BEC458', '#415F9F', '#C4988F', '#F0CB43']
    }

    new p5((p) =>
      wobblyFont(p, elementText, fontSize, colorVal, spacing, false, false, d3.select(elem).node()),
    )
  }
  handWritingDivs.style('color', 'rgba(255, 255, 255, 0)')

  d3.selectAll('.wiggly canvas')
    .style('position', 'absolute !important')
    .style('top', '0px !important')
    .style('left', '0px !important')
}
