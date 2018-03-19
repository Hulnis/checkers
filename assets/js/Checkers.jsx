import React from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'reactstrap'

export default function run_checkers_game(root, channel) {
  ReactDOM.render(<CheckersGame channel={channel}/>, root)
}

class CheckersGame extends React.Component {
  constructor(props) {
    super(props)

    // Setup socket and stuff
    this.channel = props.channel

    this.state = {
      checkers: [],
      messages: [],
      prevClick: null,
    }

    this.channel.join()
        .receive("ok", this.receiveView.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp) })
  }

  receiveView(view) {
    console.log("view", view)
    messages = this.receiveMessage(view.game.message)
    this.setState({
      checkers: view.game.checkers,
      messages: messages,
    })
  }

  receiveMessage(message) {
    const {
      messages
    } = this.state
    if (messages.length >= 3) {
      messages.slice()
    }
    return messages.push(message)
  }

  clickCard(clickedCard) {
    const {
      delayOn,
    } = this.state
    if(!delayOn) {
      this.channel.push("click", { cardKey: clickedCard.key})
        .receive("ok", this.receiveView.bind(this))
    }
  }

  restartGame() {
    this.channel.push("restart")
      .receive("ok", this.receiveView.bind(this))
  }

  render() {
    const {
      cards,
      counter,
    } = this.state
    console.log("cards", cards)
    const cardDraw = []
    if(cards.length === 0) {
      return <div>Waiting on server</div>
    } else {
      for (var i = 0; i < 4; i++) {
        const row = []
        for (var j = 0; j < 4; j++) {
          const card = cards[(i * 4) + j]
          var color = "white"
          if (card.state === "solved") {
            color = "green"
          } else if (card.state === "revealed") {
            color = "coral"
          }
          const styles = {
            backgroundColor: color
          }
          const showText = (card.state === "solved" || card.state === "revealed")
          row.push(
            <div style={styles} className="card" onClick={() => this.clickCard(card)} key={card.key}>
              {showText && card.value}
            </div>
          )
        }
        cardDraw.push(<div className="col" key={"col" + i}>{row}</div>)
      }
      return (
        <div>
          <div className="row">
            {cardDraw}
          </div>
          <Button onClick={this.restartGame.bind(this)}>Restart Game</Button>
          <p>{counter}</p>
        </div>
      )
    }
  }
}
