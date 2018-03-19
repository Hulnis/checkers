import React from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'reactstrap'
import { Stage, Layer, Rect, Circle } from 'react-konva';

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

  clickChecker(index) {
    const {
      delayOn,
    } = this.state
    if(!delayOn) {
      this.channel.push("click", { cardKey: clickedCard.key})
        .receive("ok", this.receiveView.bind(this))
    }
  }

  clickRect(index) {

  }

  restartGame() {
    this.channel.push("restart")
      .receive("ok", this.receiveView.bind(this))
  }

  render() {
    const {
      // checkers,
      messages,
    } = this.state
    const demoCheckers = []
    demoCheckers.push({
      color: "red",
      index: 0,
      x: 0,
      y: 1,
    })
    const grid = []
    var colorSwitch = false
    // if(checkers.length === 0) {
    //   return <div>Waiting on server</div>
    // } else {
    for (var i = 0; i < 8; i++) {
      colorSwitch = !colorSwitch
      for (var j = 0; j < 8; j++) {
        // color pattern
        var color = "black"
        if (colorSwitch) {
          color = "white"
        }
        colorSwitch = !colorSwitch
        const square = <Rect key={"index:" + i + ", " + j} x={i * 100} y={j * 100}
                             width={100} height={100} fill={color}
                             onClick={()=>this.clickRect(1 + x + (y * 8))}/>
        grid.push(square)
      }
    }
    console.log("demoCheckers", demoCheckers)
    demoCheckers.forEach((checker) => {
      grid.push( <Circle key={checker.index} color={checker.color}
                              x={checker.x * 100} y={checker.y * 100}/>)
    })
    grid.push(<Rect key="outside" x={0} y={0} width={810} height={810} fillEnabled={false}
               stroke="black" strokeWidth={10}/>)
    return (
      <div>
        <Stage width={810} height={810}>
          <Layer>
            { grid }
          </Layer>
        </Stage>
        <Button onClick={this.restartGame.bind(this)}>Restart Game</Button>
      </div>
    )
    // }
  }

}
