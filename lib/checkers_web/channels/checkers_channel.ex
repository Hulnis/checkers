defmodule CheckersWeb.Channel do
  use CheckersWeb, :channel

  alias Checkers.Game

  def join("game:" <> name, _params, socket) do
      game = Checkers.Backup.load(name) || Game.init()
      {id, game} = Game.add_player(game)
      if id == -1 do
        {:error, %{"reason" => "game already has two players"}}
      else
        socket = socket
        |> assign(:name, name)
        |> assign(:game, game)
        Checkers.Backup.save(socket.assigns[:name], game)
        {:ok, %{"join" => name, "game" => game, "player" => id}, socket}
      end
    end

    def handle_in("turn", %{"player" => player, "from" => from, "to" => to}, socket) do
      game = Game.take_turn(socket.assigns[:game], player, from, to)
      socket = assign(socket, :game, game)
      Checkers.Backup.save(socket.assigns[:name], game)
      broadcast(socket, "update", {:ok, %{"game" => game}})
      {:reply, {:ok, %{"game" => game}}, socket}
    end

    def handle_in("restart", %{}, socket) do
      game = Game.init()
      {black, game} = Game.add_player(game)
      {red, game} = Game.add_player(game)
      socket = assign(socket, :game, game)
      Checkers.Backup.save(socket.assigns[:name], game)
      {:reply, {:ok, %{"game" => game, "black" => black, "red" => red}}, socket}
    end
end
