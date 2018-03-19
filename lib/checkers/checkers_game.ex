defmodule Checkers.Game do
  @moduledoc """
  State logic for checkers.
  """

  @doc """
  Initializes the state for a new checkers game.
  """
  def init() do
    board = Enum.map(0..23, &(init_pieces(&1, :red, 1)))
    |> Enum.concat(Enum.map(24..39, fn _ -> nil end))
    |> Enum.concat(Enum.map(40..63, &(init_pieces(&1, :black, -1))))

    %{board: board, current_player: nil, players: %{}}
  end

  defp init_pieces(index, color, direction) do
    mod = if color == :red, do: 0, else: 1
    if rem(index, 2) == mod do
      %{index: index, color: color, direction: direction, crowned: false}
    else
      nil
    end
  end

  @doc """
  Adds a player to the game.
  """
  def add_player(state, player) do
    cond do 
      length(Map.keys(state[:players])) >= 2 ->
        state
      state[:current_player] == nil ->
        %{state | current_player: player, players: Map.put(state[:players], player, :black)}
      true ->
        %{state | players: Map.put(state[:players], player, :red)}
    end  
  end

  @doc """
  Moves the selected piece for the given player.
  """
  def take_turn(state, player, index, to) do
    from = Enum.at(state[:board], index) 
    cond do
      player != state[:current_player] or
      from == nil or
      from[:color] != state[:players][player] or
      Enum.at(state[:board], to) != nil ->
        state
      to in possible_moves(from) -> 
        move(state, from, to)
      to in possible_jumps(from) ->
        jump(state, from, to)
      true ->
        state
   end
  end

  defp possible_moves(from = %{direction: 0}) do
    possible_moves(%{from | direction: 1}) ++ possible_moves(%{from | direction: -1})
  end

  defp possible_moves(%{index: index, direction: direction}) do
    possible_squares(index, 1, direction)
  end

  defp possible_jumps(from = %{direction: 0}) do
    possible_jumps(%{from | direction: 1}) ++ possible_jumps(%{from | direction: -1})
  end

  defp possible_jumps(%{index: index, direction: direction}) do
    possible_squares(index, 2, direction)
  end

  defp possible_squares(index, row, direction) do
    Enum.map([index - row, index + row], &(&1 + 8 * row * direction))
    |> Enum.reject(&(&1 < 0 or &1 > 63))
    |> Enum.filter(&(rem(&1, 8) == rem(index, 8) + row * direction))
  end

  defp move(state, from = %{index: index}, to) do
    from = crown(from)
    board = state[:board]
    |> List.replace_at(to, %{from | index: to})
    |> List.replace_at(index, nil)
    %{state | board: board, current_player: next_player(state)}
  end

  defp jump(state, from = %{index: index}, to) do
    from = %{from | index: to} |> crown(to)
    board = state[:board]
    |> List.replace_at(to, from)
    |> List.replace_at(index, nil)
    |> List.replace_at(index + (to - index) / 2, nil)
    if possible_jumps(from) != [] do
      %{state | board: board}
    else 
      %{state | board: board, current_player: next_player(state)}
    end
  end

  defp crown(from, to) do
    if to in 0..7 or to in 56..63, do: %{from | crowned: true}, else: from
  end

  defp next_player(state) do
    state[:players]
    |> Map.keys
    |> Enum.reject(&(&1 == state[:current_player]))
    |> List.first
  end 
end
