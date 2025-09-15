// Simple working test to verify Jest setup
describe('Weather App Basic Tests', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('DOM environment is available', () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
  });

  test('Fetch mock is available', () => {
    expect(fetch).toBeDefined();
    expect(typeof fetch.mockResolvedValue).toBe('function');
  });

  test('localStorage mock is available', () => {
    expect(localStorage).toBeDefined();
    expect(typeof localStorage.getItem).toBe('function');
  });
});