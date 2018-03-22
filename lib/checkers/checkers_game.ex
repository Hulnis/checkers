defmodule Checkers.Game do
  @moduledoc """
  State logic for checkers.
  """

  @doc """
  Initializes the state for a new checkers game.
  """
  def init() do
    board = List.flatten(Enum.map([0, 8, 16], &(init_row(&1, :red))))
    |> Enum.concat(Enum.map(24..39, fn _ -> nil end))
    |> Enum.concat(List.flatten(Enum.map([40, 48, 56], &(init_row(&1, :black)))))

    %{board: board, black_loss: 0, red_loss: 0, current_player: nil, players: %{}}
  end

  defp init_row(first, color) do
    offset = rem(div(first, 8), 2)
    row = Enum.map(0..3, &(first + offset + &1 * 2))
    |> Enum.map(&(init_piece(&1, color)))
    |> Enum.intersperse(nil)
    if offset == 0, do: row ++ [nil], else: [nil] ++ row
  end

  defp init_piece(index, color) do
    direction = if color == :red, do: 1, else: -1
    %{index: index, color: color, direction: direction, crowned: false}
  end

  @doc """
  Adds a player to the game.
  """
  def add_player(state) do
    id = generate_player_id(state)
    cond do 
      length(Map.keys(state[:players])) >= 2 ->
        {-1, state}
      state[:current_player] == nil ->
        {id, %{state | current_player: id, players: Map.put(state[:players], id, :black)}}
      true ->
        {id, %{state | players: Map.put(state[:players], id, :red)}}
    end  
  end

  defp generate_player_id(state) do
    id = Enum.random(0..1000)
    if Map.has_key?(state[:players], id) do
      generate_player_id(state)
    else
      Integer.to_string(id)
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
    from = %{from | index: to} |> crown(to)
    board = state[:board]
    |> List.replace_at(to, from)
    |> List.replace_at(index, nil)
    %{state | board: board, current_player: next_player(state)}
  end

  defp jump(state, from = %{index: index}, to) do
    from = %{from | index: to} |> crown(to)
    board = state[:board]
    |> List.replace_at(to, from)
    |> List.replace_at(index, nil)
    |> List.replace_at(index + (to - index) / 2, nil)
    state = %{state | board: board}

    state =
      if state[:players][state[:current_player]] == :red do
        %{state | black_loss: state[:black_loss] + 1}
      else
        %{state | red_loss: state[:red_loss] + 1}
      end

    if possible_jumps(from) == [] do
      %{state | current_player: next_player(state)}
    else
      state
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

  @doc """
  Returns whether the current player won.
  """
  def is_winner?(state) do
    if state[:players][state[:current_player]] == :red do
      state[:black_loss] == 12
    else
      state[:red_loss] == 12
    end
  end
end
