const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardContent(index) {
    // 0-12：黑桃 1-13
    // 13-25：愛心 1-13
    // 26-38：方塊 1-13
    // 39-51：梅花 1-13

    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
    `
  },

  getCardElement(index) {


    return `
      <div data-index="${index}" class="card back"></div>
    `
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
    const rootElement = document.querySelector('#cards')

    rootElement.innerHTML = indexes
      // map: 對陣列中的每一個元素都這樣做
      .map(index => this.getCardElement(index))

      // join: 把陣列裡面的每一個元素連起來
      .join('')
  },

  // flipCard(card)
  // flipCards(1, 2, 3, 4, 5) 
  // cards = [1, 2, 3, 4, 5]
  flipCards(...cards) {　// 可以把所有的參數變成一個陣列
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
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
    document.querySelector('.score').textContent = `Score:${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried-times').textContent = `You've tried ${times} times.`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        card.classList.remove('wrong')
      }, {
        // 這個eventListener只會觸發一次，觸發完之後就立刻卸載（因為同一張卡片如果被點很多次就會裝上eventListener很多次）：非必要，但加上去對瀏覽器的負擔會比較小
        once: true
      })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried ${model.triedTimes} times.</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)

        view.flipCards(card)
        model.revealedCards.push(card)

        if (model.isRevealedCardsMatched()) {
          // 配對正確
          view.renderScore((model.score) += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

}

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0,
}

const utility = {
  getRandomNumberArray(count) {
    // ex: count = 5 => [0, 4, 1, 3, 2]
    // Array.from(Array(a).keys()) 可以產生一個0-(a-1)陣列（共a個）
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        // 把陣列裡面的兩個元素做交換
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

// Node List (array-like)
// array-like不是真的陣列，不能使用map，只能用forEach

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})