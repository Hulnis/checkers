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
      checkers,
      messages,
    } = this.state
    const grid = []
    const colorSwitch = false
    if(checkers.length === 0) {
      return <div>Waiting on server</div>
    } else {
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          // color pattern
          const color = "black"
          if (colorSwitchcolorSwitch) {
            colorSwitch = false
            color = "white"
          } else {
            colorSwitch = true
          }

          const square = <Rect key={"index:" + i + ", " + j} x={i * 100} y={j * 100}
                               width={100} height={100} fill={color} />
          grid.push(square)
        }
      }
      return (
        <div>
          <Stage width={800} height={800}>
            <Layer>
              { grid }
            </Layer>
          </Stage>
          <Button onClick={this.restartGame.bind(this)}>Restart Game</Button>
        </div>
      )
    }
  }

}
