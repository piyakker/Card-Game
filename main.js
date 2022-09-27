const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchedFailed: 'CardMatchedFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

//呈現畫面的函式
const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <p>${number}</p>
    <img src="${symbol}">
    <p>${number}</p>
    `
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("");
  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return //記得return掉，不然會移除再加上，無限循環
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried ${times} times.`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried ${model.triedTimes} times.</p>
    `
    div.classList.add('completed')
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model = {
  revealedCard: [],

  isRevealedCArdMatched() {
    return this.revealedCard[0].dataset.index % 13 === this.revealedCard[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}

//外掛函式庫
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同遊戲狀態，做不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.renderTriedTimes(model.triedTimes += 1)
        view.flipCards(card)
        model.revealedCard.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCard.push(card)

        if (model.isRevealedCArdMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCard)
          model.revealedCard = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardMatchedFailed
          view.appendWrongAnimation(...model.revealedCard)
          setTimeout(this.resetCards, 1000)
          this.currentState = GAME_STATE.FirstCardAwaits
        }
        break

    }
  },

  resetCards() {
    view.flipCards(...model.revealedCard)
    model.revealedCard = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}



controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})