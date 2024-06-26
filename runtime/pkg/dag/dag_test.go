package dag

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAcyclic(t *testing.T) {
	d := New(hash)
	require.True(t, d.Add(1, 2))
	require.True(t, d.Add(2, 3, 4))
	require.True(t, d.Add(3, 4))
	require.False(t, d.Add(4, 1))
	require.Len(t, d.vertices, 4)
	require.True(t, d.Add(4))
	require.ElementsMatch(t, []int{1, 2, 3}, d.Descendents(4))
}

func TestSelfReference(t *testing.T) {
	d := New(hash)
	require.False(t, d.Add(1, 1))

	d = New(hash)
	require.True(t, d.Add(2, 1))
	require.False(t, d.Add(1, 1))
}

func TestRetention(t *testing.T) {
	d := New(hash)
	require.True(t, d.Add(1, 2))
	require.True(t, d.Add(2, 3))
	require.Len(t, d.vertices, 3)

	require.True(t, d.Add(3))
	require.Len(t, d.vertices, 3)
	require.ElementsMatch(t, []int{3}, d.Parents(2, true))
	require.ElementsMatch(t, []int{3}, d.Parents(2, false))

	d.Remove(2)
	require.Len(t, d.vertices, 3)
	require.ElementsMatch(t, []int{}, d.Children(3))
	require.ElementsMatch(t, []int{}, d.Parents(1, true))
	require.ElementsMatch(t, []int{2}, d.Parents(1, false))

	d.Remove(1)
	require.Len(t, d.vertices, 1)
	require.ElementsMatch(t, []int{}, d.Children(3))
}

func TestPanics(t *testing.T) {
	// Already exists
	d := New(hash)
	require.True(t, d.Add(1))
	require.Panics(t, func() { d.Add(1) })

	// Doesn't exist
	d = New(hash)
	require.True(t, d.Add(1))
	require.Panics(t, func() { d.Remove(2) })
	require.Panics(t, func() { d.Parents(2, false) })
	require.Panics(t, func() { d.Children(2) })
}

func TestParents(t *testing.T) {
	d := New(hash)
	require.True(t, d.Add(1, 2))
	require.True(t, d.Add(2, 3))
	require.True(t, d.Add(3))
	require.Len(t, d.vertices, 3)

	// Remove 3, check it's a non-present parent
	d.Remove(3)
	require.ElementsMatch(t, []int{3}, d.Parents(2, false))
	require.ElementsMatch(t, []int{}, d.Parents(2, true))

	// Add 3 back and remove 2, then add 2 back without a reference to 3 and check
	require.True(t, d.Add(3))
	d.Remove(2)
	require.True(t, d.Add(2))
	require.Len(t, d.Parents(2, false), 0)
}

func hash(i int) int {
	return i
}
