defmodule CheckersWeb.Channel do
  use CheckersWeb, :channel

  alias Checkers.Game

  def join("game:" <> name, player, socket) do
    if authorized?(player) do
      game = Checkers.Backup.load(name) || Game.init()
      |> Game.add_player(player)
      socket = socket
      |> assign(:name, name)
      |> assign(:game, game)
      {:ok, %{"join" => name, "game" => game}, socket}
    else
      {:error, %{"reason" => "unauthorized"}}
    end
  end

  def handle_in("turn", %{"player": player, "from": from, "to": to}, socket) do
    game = Game.take_turn(socket.assigns[:game], player, from, to)
    socket = assign(socket, :game, game)
    Checkers.Backup.save(socket.assigns[:name], game)
    {:reply, {:ok, %{"game": game}}, socket}
  end

  def handle_in("restart", %{"black": black, "red": red}, socket) do
    game = Game.init()
    |> Game.add_player(black)
    |> Game.add_player(red)
    socket = assign(socket, :game, game)
    Checkers.Backup.save(socket.assigns[:name], game)
    {:reply, {:ok, %{"game": game}}, socket}
  end

  defp authorized?(_player) do
    return true
  end
end
