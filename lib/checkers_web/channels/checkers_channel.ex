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
        socket = socket
        |> assign(:name, name)
        |> assign(:game, game)
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
      Checkers.Backup.save(socket.assigns[:name], game)
      push(socket, "restart", %{"game" => game, "player" => id})
      broadcast_from(socket, "update", %{"game" => game})
      {:noreply, socket}
    end

    def handle_in("turn", %{"player" => player, "from" => from, "to" => to}, socket) do
      game = Game.take_turn(socket.assigns[:game], player, from, to)
      socket = assign(socket, :game, game)
      Checkers.Backup.save(socket.assigns[:name], game)
      broadcast_from(socket, "update", %{"game" => game})
      {:reply, {:ok, %{"game" => game}}, socket}
    end

    def handle_in("restart", %{}, socket) do
      {id, game} = Game.init()
      |> Game.add_player()
      socket = assign(socket, :game, game)
      Checkers.Backup.save(socket.assigns[:name], game)
      broadcast_from(socket, "restart", %{"game" => game})
      {:reply, {:ok, %{"game" => game, "player" => id}}, socket}
    end
end
