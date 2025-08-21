<template>
  <main>
    <div id="progress-container">
      <div id="progress-text" :style="progressText">
        {{ state.questionIdx - 1 }}/{{ numQuestions }}
      </div>
      <div id="progress-rect" :style="progressRectWidth"></div>
    </div>

    <Login v-if="state.questionIdx == 0" @submit="handleSubmit" />
    <p v-if="state.question == undefined" class="loading">loading...</p>
    <component
      v-if="state.question && state.questionIdx > 0 && !state.isDone"
      :is="questionViews[state.question.type]"
      :description="state.question.description"
      :question="state.question.question"
      :options="state.answerOptions"
      :selectMultiple="false"
      @submit="handleSubmit"
    />
    <Results v-if="state.isDone" :fruitScores="state.fruitScores" :fruits="fruits" />
  </main>
</template>

<script setup>
import * as d3 from 'd3'
import { reactive, ref, computed } from 'vue'
import Login from './Login.vue'
import Organize from '@/quizViews/Organize.vue'
import Memory from '@/quizViews/Memory.vue'
import Cafe from '@/quizViews/Cafe.vue'
import Question from '@/quizViews/Question.vue'
import Results from './Results.vue'
import BlindBox from '../quizViews/BlindBox.vue'
// questions
const questionViews = {
  text: Question,
  Memory: Memory,
  Organize: Organize,
  BlindBox: BlindBox,
}

// tracking game state
const state = reactive({
  // quiz stuff
  isDone: false,
  questionIdx: 3,
  question: undefined,
  answerOptions: undefined,

  // scoring
  answerHistory: [],
  fruitScores: reactive({}),
})
const numQuestions = ref(0)

// loading the question data
const csvLink = `https://docs.google.com/spreadsheets/d/e/2PACX-1vT_d_Zg8uFKhpF0NRw55qgn5Sv-kzrlGwDGvtQmrqjecKzg2jGDabwwYA96XyKPLHBiUloY63mYmh6P/pub?output=csv`
const gids = {
  answers: 1594981229,
  questions: 403111158,
  fruits: 926541593,
}
const sheetLinks = {
  answers: csvLink + `&gid=${gids['answers']}`,
  questions: csvLink + `&gid=${gids['questions']}`,
  fruits: csvLink + `&gid=${gids['fruits']}`,
}

let fruits, questions, answers, fruitNames
Promise.all([
  d3.csv(sheetLinks.fruits),
  d3.csv(sheetLinks.questions),
  d3.csv(sheetLinks.answers),
]).then(([f, q, a]) => {
  fruits = f
  fruitNames = f.map((e) => e['Fruit'])
  questions = q
  answers = a
  numQuestions.value = questions.length
  // numQuestions.value = 4
  // numQuestions = 2

  console.log('Fruits', fruits)
  console.log('Questions', questions)
  console.log('Answers', answers)

  // // setup the state
  // state.questionIdx = 1
  for (const fruit of fruitNames) {
    state.fruitScores[fruit] = 0 //initialize all fruit scores to 0
  }
  console.log('FRUIT STATE', state.fruitScores)
  layoutQuestion()
})

const progressRectWidth = computed(() => {
  return {
    backgroundColor: 'var(--yellow)',
    height: '100%',
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: (state.questionIdx - 1) * (window.innerWidth / numQuestions.value) + 'px',
  }
})
const progressText = computed(() => {
  return {
    color: 'var(--brown)',
    position: 'absolute',
    top: '0px',
    left: 5 + (state.questionIdx - 1) * (window.innerWidth / numQuestions.value) + 'px',
  }
})

function handleLogin(answer) {
  console.log('HANDLING LOIGIN', answer)
}

function handleSubmit(answer) {
  state.answerHistory.push(answer)
  console.log('RECIEVED ANSWER', answer)
  // login
  if (state.questionIdx == 0) {
    handleLogin(answer)
  } else {
    if (questions == undefined || answers == undefined) {
      console.log('data not loaded')
      return
    }
    // if (state.questionIdx != state.answerHistory.length - 1) {
    //   console.log(state.questionIdx, state.answerHistory.length)
    //   console.log('Something wrong with lengths')
    //   return
    // }
  }

  // score question
  console.log('score question')
  scoreQuestion(answer)

  // layout the next question
  state.questionIdx += 1
  console.log(
    `Completed Question, now laying out ${state.questionIdx} out of ${numQuestions.value}`,
  )
  if (numQuestions.value < state.questionIdx) {
    finishQuiz()
  } else {
    layoutQuestion()
  }
}

function scoreQuestion(answer) {
  // get the options possible for this question
  const answerScores = answers.filter((entry) => entry.answer == answer)
  if (answerScores.length == 0) {
    console.log('the names of your answers do not correspond to any scores')
    return
  }

  // save the results of the quesiton
  for (const fruitName of fruitNames) {
    state.fruitScores[fruitName] += Number(answerScores[0][fruitName])
  }
  console.log('SCORES')
  console.log(state.fruitScores)
}

function layoutQuestion() {
  console.log('layout of question')
  // get the current question
  const questionData = questions.filter((q) => q.q_key == state.questionIdx)
  if (!questionData || questionData.length == 0) {
    console.log('no question found')
    return
  }
  const { q_key, question, description, type } = questionData[0]
  state.question = questionData[0]

  // get the current quesiton answers
  state.answerOptions = answers.filter((a) => a.q_key == q_key).map((a) => a.answer)

  console.log(state.fruitScores)
}

function finishQuiz() {
  console.log('---------------')
  console.log('QUIZ FINISHED', state.fruitScores)
  state.isDone = true
  // save the score in the database

  //display the score pie chart

  //compare you to others
}
</script>

<style scoped>
.main {
  height: 100%;
  width: 100%;
}
.loading {
  position: fixed;
  left: 0px;
  width: 100%;
  top: 40vh;
  text-align: center;
}
#progress-container {
  width: 100vw;
  height: 15px;
  border: none;
  /* border: 1px solid var(--yellow); */
  position: fixed;
  top: 0px;
  left: 0px;
}
#progress-rect {
  transition: width 1s cubic-bezier(0.39, 0.575, 0.565, 1);
}
#progress-text {
  color: var(--brown);
  position: absolute;
  z-index: 10;
  font-size: 10px;
  transition: all 1s cubic-bezier(0.39, 0.575, 0.565, 1);
}
</style>
