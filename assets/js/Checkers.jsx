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
      prevClick,
    } = this.state
    if(prevClick) {
      console.log("you fail!")
    } else {
      this.setState({
        prevClick: index
      })
    }
  }

  clickRect(index) {
    const {
      prevClick,
    } = this.state
    console.log("type", typeof(prevClick))
    if(typeof(prevClick) === "number") {
      console.log("Index of rect", index)
      // this.channel.push("click", { cardKey: clickedCard.key})
      //   .receive("ok", this.receiveView.bind(this))
      this.setState({
        prevClick: null
      })
    } else {
      console.log("you fail!")
    }
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
      x: 1,
      y: 1,
    })
    const grid = []
    var colorSwitch = true
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
                             onClick={()=>this.clickRect(i + (j * 8))}/>
        grid.push(square)
      }
    }
    console.log("demoCheckers", demoCheckers)
    demoCheckers.forEach((checker) => {
      grid.push( <Circle key={
        checker.index} fill={checker.color} x={(checker.x * 100) + 50} y={(checker.y * 100) + 50}
        radius={40} onClick={() => this.clickChecker(checker.index)} />
      )
    })
    grid.push(<Rect key="outside" x={0} y={0} width={800} height={800} fillEnabled={false}
               stroke="black" strokeWidth={10}/>)
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
    // }
  }

}
