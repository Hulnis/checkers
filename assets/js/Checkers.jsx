import React from 'react'
import ReactDOM from 'react-dom'
import { Alert, Button } from 'reactstrap'
import { Circle, Image, Layer, Rect, Stage } from 'react-konva';

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
      crownImage: null,
      messages: [],
      prevClick: null,
    }

    this.channel.join()
        .receive("ok", this.receiveMessage.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp) })

    this.channel.on("update", (resp) => {
      console.log("update message", resp["game"])
      this.receiveUserMessage(resp["message"])
      this.receiveGame(resp["game"])
    })

    this.channel.on("restart", (resp) => {
        this.receiveUserMessage(resp["message"])
        this.receiveGame(resp["game"])
    })

    this.channel.on("winner", (resp) => {
        this.receiveUserMessage("You Won!")
    })

    this.channel.on("loser", (resp) => {
        this.receiveUserMessage("You Fail!")
    })
  }

  componentDidMount() {
    console.log("image", imageObj)
    const imageObj = new window.Image()
    imageObj.src = "https://upload.wikimedia.org/wikipedia/commons/2/25/Simple_gold_crown.svg"
    imageObj.onload = () => {
      this.setState({
        crownImage: imageObj
      })
    }
  }

  receiveMessage(resp) {
    console.log("resp", resp)
    console.log("game", resp["game"])
    this.receiveGame(resp["game"])
  }

  receiveGame(game) {
    console.log("game receive", game)
    const grid = game
    const checkers = []

    grid.forEach((grid) => {
      if (grid != null) {
        const {
          color,
          crowned,
          index,
        } = grid
        const x = index % 8
        const y = (index - x) / 8
        checkers.push({
          color: color,
          index: index,
          x: x,
          y: y,
          crowned: crowned
        })
      }
    })
    this.receiveUserMessage(game.message)
    this.setState({
      checkers: checkers,
    })
  }

  receiveUserMessage(message) {
    var {
      messages
    } = this.state
    console.log("adding message -----", message)
    if (message != null) {
      if (messages.length >= 3) {
        messages.shift()
      }
      messages.push(message)
      messages = messages.reverse()
      this.setState({
        messages: messages
      })
    }
  }

  clickChecker(index) {
    const {
      prevClick,
    } = this.state
    if(prevClick) {
      this.receiveUserMessage("Invalid Click")
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
      this.channel.push("turn", {
        from: prevClick,
        to: index,
      })
      this.setState({
        prevClick: null
      })
    } else {
      this.receiveUserMessage("Invalid Click")
    }
  }

  restartGame() {
    this.channel.push("restart")
      .receive("ok", this.receiveMessage.bind(this))
  }

  render() {
    const {
      checkers,
      crownImage,
      messages,
    } = this.state

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
      grid.push( <Circle key={checker.index} fill={checker.color} x={(checker.x * 100) + 50} y={(checker.y * 100) + 50}
        radius={40} onClick={() => this.clickChecker(checker.index)} />
      )
      if(checker.crowned) {

        grid.push(
          <Image image={crownImage} key={"crown" + checker.index}
                 x={(checker.x * 100) + 25} y={(checker.y * 100) + 0}
                 width={50} height={50} />
        )
      }
    })
    grid.push(<Rect key="outside" x={0} y={0} width={800} height={800} fillEnabled={false}
               stroke="black" strokeWidth={10}/>)

    const msgs = messages.map((msg, index) => {
      return <Alert color="primary" key={index}>{msg}</Alert>
    })
    console.log("drawing messages", msgs)

    return (
      <div>
        <div>
          {msgs}
        </div>
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
