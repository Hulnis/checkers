# checkers

- Pre Game
  - View: see the checkerboard, message on top "Waiting for two players"
  - On connect, look up elixir session stuff about players (Or use a login session) Decide Later
- In Game
  - Backend game state
     - List of checkers
       - grid position - int index
       - color - string (red or black)
       - isKing - boolean - default false
       - index - for uniqueness stuff
     - Game State
       - "pregame"
       - "ingame"
       - "postgame"
     - Whose turn it is
       - tbd, see 1b
     - List of people connected
       - tbd see 1b
  - Message box for alerts etc
- Post Game
  - view finished board, message of "You won" "You lost" Restart button
- API
  - Restart
    - restarts the game ezpz
  - Make Move
    - Index 1 (location of clicks)
    - Index 2 (location of clicks)
    - care about user who did clicks
- Front end state
  - list of checkers
  - message
