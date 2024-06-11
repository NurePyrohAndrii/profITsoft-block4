const FLIGHTS_SERVICE_URL = 'http://block2-flight-service:8181/api/flights';

export const existsByFlightId = async (
  id: string
): Promise<boolean> => {
  const res = await fetch(`${FLIGHTS_SERVICE_URL}/${id}`);
  return res.status === 200;
};