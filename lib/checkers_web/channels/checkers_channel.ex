defmodule CheckersWeb.Channel do
  use CheckersWeb, :channel

  alias Checkers.Game

  def join("game:" <> name, player, socket) do
    if authorized?(player) do
      game = Checkers.Backup.load(name) || Game.init()
      {id, game} = Game.add_player(game)
      IO.puts("id")
      IO.inspect(id)
      if id == -1 do
        {:error, %{"reason" => "game already has two players"}}
      else
        socket = socket
        |> assign(:name, name)
        |> assign(:game, game)
        {:ok, %{"join" => name, "game" => game, "player" => Integer.to_string(id)}, socket}
      end
    else
      {:error, %{"reason" => "unauthorized"}}
    end
  end

  def handle_in("turn", %{"player": player, "from": from, "to": to}, socket) do
    game = Game.take_turn(socket.assigns[:game], Integer.parse(player), from, to)
    socket = assign(socket, :game, game)
    Checkers.Backup.save(socket.assigns[:name], game)
    {:reply, {:ok, %{"game": game}}, socket}
  end

  def handle_in("restart", %{}, socket) do
    game = Game.init()
    {black, game} = Game.add_player(game)
    {red, game} = Game.add_player(game)
    socket = assign(socket, :game, game)
    Checkers.Backup.save(socket.assigns[:name], game)
    {:reply, {:ok, %{"game" => game, "black" => black, "red" => red}}, socket}
  end

  defp authorized?(_player) do
    true
  end
end
