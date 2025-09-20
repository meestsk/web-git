// src/utils/errorHandler.js
export function handleFetchError(fetchError) {
  console.error('❌ Fetch Error Details:');
  console.error('  Message:', fetchError.message || 'No message');
  console.error('  Name:', fetchError.name || 'Unknown');
  console.error('  Stack:', fetchError.stack || 'No stack trace');

  if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
    console.error('🚫 Network Error - Possible causes:');
    console.error('  1. Backend server is not running');
    console.error('  2. CORS policy blocking the request');
    console.error('  3. Wrong URL or port');
    console.error('  4. Firewall blocking the connection');
  }
  throw fetchError;
}
