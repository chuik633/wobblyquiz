<template>
  <div class="game-container"></div>
</template>

<style lang="css" scoped></style>

<script setup lang="ts">
import { onMounted } from 'vue'
import * as d3 from 'd3'
import { colors } from '@/quizViews/settings.js'

const emit = defineEmits(['submit'])
const cardColors = Array.from(Object.entries(colors))
  .filter((c) => c[0] != 'black')
  .map((c) => c[1])

onMounted(() => {
  const gameContainer = d3.select('.game-container')
  let mistakes = 0
  const width = window.innerWidth - 100
  const height = window.innerHeight - 100
  let done = false
  const timer = gameContainer.append('div').attr('class', 'timer').text('0:00')
  const startTime = Date.now()
  setInterval(() => {
    const elapsedSecs = Math.floor((Date.now() - startTime) / 1000).toString()
    const digitCount = elapsedSecs.length
    if (done) {
      timer.style('color', 'var(--red)')
      return
    }
    if (digitCount < 2) {
      timer.text(`0:0${elapsedSecs}`)
    } else if (digitCount == 2) {
      timer.text(`0:${elapsedSecs}`)
    } else if (digitCount == 3) {
      timer.text(`${elapsedSecs[0]}:${elapsedSecs[1]}${elapsedSecs[2]}`)
    } else {
      timer.style('color', 'var(--red)')
    }
  }, 1000)
  const svg = gameContainer
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('border', '1px solid black')

  const numPairs = 3
  const numbers = Array.from({ length: numPairs * 2 }, (_, i) => i % numPairs)
  const colorKeys = [...numbers].sort(() => Math.random() - 0.5)

  const numRows = Math.ceil((numPairs * 2) ** 0.5)
  const numCols = Math.ceil((numPairs * 2) / numRows)
  const w = width / numCols
  const h = height / numRows
  for (let cardCount = 0; cardCount < numPairs * 2; cardCount++) {
    svg
      .append('rect')
      .attr('class', 'card')
      .attr('state', 0) //0 unselected, 1 previously selected, 2 completed
      .attr('index', cardCount)
      .attr('key', colorKeys[cardCount])
      .attr('x', (cardCount % numCols) * w)
      .attr('y', Math.floor(cardCount / numCols) * h)
      .attr('fill', colors.neutral)
      .attr('stroke', 'black')
      .attr('width', w)
      .attr('height', h)
      .on('click', function event() {
        const thisCard = d3.select(this)
        if (thisCard.attr('state') == 2) {
          return
        }
        const prevs = d3.selectAll('.card[state="1"]')
        const prevCount = prevs.size()
        d3.select(this).attr('fill', cardColors[colorKeys[cardCount]])
        if (prevCount == 0) {
          thisCard.attr('state', 1)
        } else if (prevCount == 1) {
          const prevNode = prevs.nodes()[0]
          const prevCard = d3.select(prevNode)
          const prevIdx = prevCard.attr('index')
          const currentIdx = thisCard.attr('index')
          if (prevIdx == currentIdx) {
            return
          }

          const prevKey = prevCard.attr('key')
          const currentKey = thisCard.attr('key')
          thisCard.attr('state', 1)
          if (prevKey === currentKey) {
            //math
            prevCard.attr('state', 2)
            thisCard.attr('state', 2)

            d3.selectAll('.card[state="2"]').attr('fill', colors.black)
          } else {
            mistakes += 1
            setTimeout(() => {
              prevCard.attr('state', 0).attr('fill', colors.neutral)
              thisCard.attr('state', 0).attr('fill', colors.neutral)
            }, 1000)
          }
        } else {
          d3.selectAll('.card[state="1"]').attr('state', 0).attr('fill', colors.neutral)
          d3.selectAll('.card[state="2"]').attr('fill', colors.black)
          thisCard.attr('state', 1)
        }
        checkWin()
      })
    // checks if they are done
    function checkWin() {
      if (d3.selectAll('.card[state="2"]').size() == numPairs * 2) {
        handleWin()
        return true
      } else {
        return false
      }
    }
    function handleWin() {
      console.log('solved')
      let output = ''
      if (mistakes > numPairs) {
        output = 'mistakes_'
      } else {
        output = 'nomistakes_'
      }
      const finalTime = Math.floor((Date.now() - startTime) / 1000)
      console.log(finalTime)
      if (finalTime < 30) {
        output += 'fast'
      } else {
        output += 'slow'
      }
      emit('submit', output)
      return output
    }
  }
})
</script>
