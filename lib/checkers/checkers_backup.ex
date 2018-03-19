defmodule Checkers.Backup do
  use Agent

  @doc """
  Initializes the agent with an empty map.
  """
  def start_link() do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  @doc """
  Saves the given game using name as its key.
  """
  def save(name, game) do
    Agent.update(__MODULE__, &(Map.put(&1, name, game)))
  end

  @doc """
  Loads a game using the given key.
  """
  def load(name) do
    Agent.get(__MODULE__, &(Map.get(&1, name)))
  end
end
