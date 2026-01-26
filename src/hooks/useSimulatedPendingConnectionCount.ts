/**
 * SIMULATION MODE: Pending Connection Count Hook
 * Returns simulated count of pending connection requests.
 */

export function useSimulatedPendingConnectionCount() {
  // Return a simulated count for testing the UI
  return {
    count: 3, // Mock pending connections count
    loading: false,
    refresh: () => {},
    isSimulated: true,
  };
}
