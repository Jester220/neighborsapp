import { useState, useCallback } from 'react';

// Wraps the browser Geolocation API with loading/error state and
// posts the coordinates to the backend so nearby search works.
export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | granted | denied | error

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      return Promise.reject(new Error('Geolocation is not supported by this browser.'));
    }

    setStatus('loading');

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCoords(point);
          setStatus('granted');
          resolve(point);
        },
        (err) => {
          setStatus(err.code === 1 ? 'denied' : 'error');
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  return { coords, status, requestLocation };
}
