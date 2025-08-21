<template>
  <div class="results-container">
    <h4>you are...</h4>
  </div>
</template>
<style scoped></style>
<script setup>
import * as d3 from 'd3'
import { onMounted } from 'vue'
const props = defineProps({
  fruitScores: Object,
  fruits: Object,
})
onMounted(() => {
  const maxFruit = Object.keys(props.fruitScores).reduce((a, b) =>
    props.fruitScores[a] > props.fruitScores[b] ? a : b,
  )
  console.log('maxFruit', maxFruit)
  d3.select('.results-container').append('h2').text(maxFruit)
  const width = window.innerWidth - 50
  const height = width
  const radius = Math.min(width, height) / 2
  const svg = d3
    .select('.results-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)

  const color = (d) => props.fruits[d].color
  const pie = d3.pie().value((d) => d.value)
  const arc = d3.arc().innerRadius(0).outerRadius(radius)

  const data = Object.entries(props.fruitScores).map((d) => ({ label: d[0], value: d[1] }))
  console.log('Data', data)
  const arcs = svg.selectAll('arc').data(pie(data)).enter().append('g')
  arcs
    .append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => color(i))
    .attr('stroke', 'black')

  arcs
    .append('text')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .text((d) => d.data.label)
})
</script>
