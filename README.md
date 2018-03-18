# checkers

1) Pre Game
  a) View: see the checkerboard, message on top "Waiting for two players"
  b) On connect, look up elixir session stuff about players (Or use a login session) Decide Later
2) In Game
  a) Backend game state
     1) List of checkers
       grid position - int index
       color - string (red or black)
       isKing - boolean - default false
     2) Game State
       a) "pregame"
       b) "ingame"
       c) "postgame"
     3) Whose turn it is
       a) tbd, see 1b
     4) List of people connected
       a) tbd see 1b
  b) Message box for alerts etc
3) Post Game
  a) view finished board, message of "You won" "You lost" Restart button
  
4) API
  a) Restart
    1) restarts the game ezpz
  b) Make Move
    a) Index 1 (location of clicks)
    b) Index 2 (location of clicks)
    c) care about user who did clicks
    
5) Front end state
  a) list of checkers
  b) message
