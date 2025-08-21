<template>
  <div class="game-container"></div>
</template>

<style lang="css" scoped></style>

<script setup>
import { onMounted } from 'vue'
import * as d3 from 'd3'
const emit = defineEmits(['submit'])

// INFO: output of this quiz question
// [DISORGANIZED, COLOR_ORIENTED, FUNCTION_ORIENTED]
const DISORGANIZED = 0
const COLOR_ORIENTED = 1
const FUNCTION_ORIENTED = 2

onMounted(() => {
  const gameContainer = d3.select('.game-container')

  const width = window.innerWidth - 50
  const height = window.innerHeight - 100
  const binGap = 80

  let objectsData = [
    { size: 50, name: 'a.png', colorCat: 1, functionCat: 1 },
    { size: 100, name: 'b.png', colorCat: 2, functionCat: 2 },
    { size: 50, name: 'c.png', colorCat: 2, functionCat: 1 },
    { size: 100, name: 'd.png', colorCat: 1, functionCat: 2 },
  ]
  let binsData = [
    {
      w: width,
      h: height / 2 - binGap,
      x: 0,
      y: 0,
    },
    {
      w: width,
      h: height / 2 - binGap,
      x: 0,
      y: height / 2 + binGap / 2,
    },
  ]
  for (const object of objectsData) {
    object.x = Math.random() * (width - 20)
    object.y = height / 2 - binGap
  }

  const svg = gameContainer
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('border', '1px solid black')

  // created the sorting bins
  const bins = svg
    .selectAll('rect')
    .data(binsData)
    .enter()
    .append('rect')
    .attr('x', (bin) => bin.x)
    .attr('y', (bin) => bin.y)
    .attr('width', (bin) => bin.w)
    .attr('height', (bin) => bin.h)
    .attr('stroke', 'black')
    .attr('fill', 'none')

  const objects = svg
    .selectAll('image')
    .data(objectsData)
    .enter()
    .append('image')
    .attr('class', 'object')
    .attr('href', (object) => './' + object.name)
    .attr('x', (object) => object.x)
    .attr('y', (object) => object.y)
    .attr('width', (object) => object.size)
    .on('mouseenter', function event() {
      d3.selectAll('.object').attr('opacity', 0.8)
      d3.select(this).attr('opacity', 1)
    })
    .on('mouseleave', function event() {
      d3.selectAll('.object').attr('opacity', 1)
    })
    .call(
      d3
        .drag()
        .on('start', function (event, d) {
          d3.selectAll('.object').attr('opacity', 0.3)
          d3.select(this).raise().attr('opacity', 1)
        })
        .on('drag', function (event, d) {
          d.x = event.x
          d.y = event.y
          d3.select(this).attr('x', d.x).attr('y', d.y)
        }),
    )

  gameContainer
    .append('button')
    .style('position', 'absolute')
    .style('top', height / 2 + 'px')
    .style('left', width / 2 + 'px')
    .text('DONE')
    .on('click', () => {
      const output = checkOrganize()
      console.log('OUTPUT', output)
    })

  function checkOrganize() {
    // see what objects are in what bins
    for (const bin of binsData) {
      bin.objects = []
      for (const object of objectsData) {
        const inX = object.x > bin.x && object.x < bin.x + bin.w
        const inY = object.y > bin.y && object.y < bin.y + bin.h
        if (inX && inY) {
          bin.objects.push(object)
        }
      }

      // sameColorScore
      const numColor1 = bin.objects.filter((object) => object.colorCat == 1).length
      const numColor2 = bin.objects.filter((object) => object.colorCat == 2).length
      bin.colorScore = Math.max(numColor1, numColor2) / bin.objects.length

      // sameFunctionScore
      const numFunction1 = bin.objects.filter((object) => object.functionCat == 1).length
      const numFunction2 = bin.objects.filter((object) => object.functionCat == 2).length

      bin.functionScore = Math.max(numFunction1, numFunction2) / bin.objects.length
    }
    // first see if all were sorted
    const numSorted = d3.sum(binsData.map((bin) => bin.objects.length))

    // disorganized
    if (numSorted < objectsData.length - 1) {
      emit('submit', 'disorganized')
      return
    }

    if (binsData[0].colorScore == 1 || binsData[1].colorScore == 1) {
      // color oriented
      emit('submit', 'color')
      return
    } else if (binsData[0].functionScore == 1 || binsData[1].functionScore == 1) {
      // function oriented
      emit('submit', 'function')
      return
    } else {
      emit('submit', 'disorganized')
      return
    }
  }
})
</script>
