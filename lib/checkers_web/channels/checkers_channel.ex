defmodule CheckersWeb.Channel do
  use CheckersWeb, :channel

  alias Checkers.Game

  intercept(["update", "restart"])

  def join("game:" <> name, _params, socket) do
      game = Checkers.Backup.load(name) || Game.init()
      {id, game} = Game.add_player(game)
      if id == -1 do
        {:error, %{"reason" => "game already has two players"}}
      else
        socket = assign(socket, :name, name)
        |> assign(:game, game)
        |> assign(:player, id)
        Checkers.Backup.save(socket.assigns[:name], game)
        send(self(), :after_join)
        {:ok, %{"join" => name, "game" => game, "player" => id}, socket}
      end
    end

    def handle_info(:after_join, socket) do
      broadcast_from(socket, "update", %{"game" => socket.assigns[:game]})
      {:noreply, socket}
    end

    def handle_out("update", update = %{"game" => game}, socket) do
      socket = assign(socket, :game, game)
      push(socket, "update", update)
      {:noreply, socket}
    end

    def handle_out("restart", %{"game" => game}, socket) do
      {id, game} = Game.add_player(game)
      socket = assign(socket, :game, game)
      |> assign(:player, id)
      Checkers.Backup.save(socket.assigns[:name], game)
      push(socket, "restart", %{"game" => game, "player" => id})
      broadcast_from(socket, "update", %{"game" => game, "message" => "Game Restarted"})
      {:noreply, socket}
    end

    def handle_in("turn", %{"from" => from, "to" => to}, socket) do
      player = socket.assigns[:player]
      {message, game} = Game.take_turn(socket.assigns[:game], player, from, to)
      Checkers.Backup.save(socket.assigns[:name], game)
      broadcast(socket, "update", %{"game" => game, "message" => message})
      if Game.is_winner?(game, player) do
        push(socket, "winner", %{})
        broadcast_from(socket, "loser", %{})
      end
      {:noreply, socket}
    end

    def handle_in("restart", %{}, socket) do
      {id, game} = Game.init()
      |> Game.add_player()
      socket = assign(socket, :game, game)
      |> assign(:player, id)
      Checkers.Backup.save(socket.assigns[:name], game)
      broadcast_from(socket, "restart", %{"game" => game, "message" => "Game Restarted"})
      {:reply, {:ok, %{"game" => game, "player" => id}}, socket}
    end

    def handle_in("disconnect", %{}, socket) do
      broadcast_from(socket, "winner", %{})
      {:noreply, socket}
    end
end
