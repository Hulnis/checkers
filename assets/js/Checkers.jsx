import React from 'react'
import ReactDOM from 'react-dom'
import { Alert, Button } from 'reactstrap'
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
        .receive("ok", this.receiveGame.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp) })
  }

  receiveGame(resp) {
    console.log("game", resp["game"])
    console.log("player_id",  resp["player"])
    const grid = resp["game"]["board"]
    const player_id = resp["player"] || this.state.player_id
    const checkers = []

    grid.forEach((grid) => {
      if (grid != null) {
        const {
          color,
          index,
        } = grid
        const x = index % 8
        const y = (index - x) / 8
        checkers.push({
          color: color,
          index: index,
          x: x,
          y: y,
        })
      }
    })
    console.log("post loop", checkers)
    const messages = []//this.receiveMessage(game.message)
    this.setState({
      checkers: checkers,
      messages: messages,
      player_id: player_id,
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
      player_id,
      prevClick,
    } = this.state

    if(typeof(prevClick) === "number") {
      console.log("Index of rect", index)
      this.channel.push("turn", {
        player: player_id,
        from: prevClick,
        to: index,
      }).receive("ok", this.receiveGame.bind(this))
      this.setState({
        prevClick: null
      })
    } else {
      console.log("you fail!")
    }
  }

  restartGame() {
    this.channel.push("restart")
      .receive("ok", this.receiveGame.bind(this))
  }

  render() {
    const {
      checkers,
      messages,
    } = this.state
    // const demoCheckers = []
    // demoCheckers.push({
    //   color: "red",
    //   index: 0,
    //   x: 1,
    //   y: 1,
    // })
    const grid = []
    var colorSwitch = true
    for (var x = 0; x < 8; x++) {
      colorSwitch = !colorSwitch
      for (var y = 0; y < 8; y++) {
        // color pattern
        var color = "#8B4513"
        if (colorSwitch) {
          color = "white"
        }
        colorSwitch = !colorSwitch
        const index = x + (y * 8)
        const square = <Rect key={"index:" + x + ", " + y} x={x * 100} y={y * 100}
                             width={100} height={100} fill={color}
                             onClick={()=>this.clickRect(index)}/>
        grid.push(square)
      }
    }
    console.log("checker", checkers)
    checkers.forEach((checker) => {
      grid.push( <Circle key={
        checker.index} fill={checker.color} x={(checker.x * 100) + 50} y={(checker.y * 100) + 50}
        radius={40} onClick={() => this.clickChecker(checker.index)} />
      )
    })
    grid.push(<Rect key="outside" x={0} y={0} width={800} height={800} fillEnabled={false}
               stroke="black" strokeWidth={10}/>)
    // <div>
    //   {messages.map((msg) => {
    //     <Alert color="primary">msg</Alert>
    //   })}
    // </div>
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
