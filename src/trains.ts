type getCachedTrains = () => number[];
type lookupTrains = (lookupUrl: string) => number[];

//TODO - implement getCachedTrains (code below)

//TODO - implement lookupTrains (code below)

export function getAllTrains(): number[] {
  const res = new Array<number>(100);
  for (let i = 0; i < res.length; i++) {
    res[i] = Math.floor(Math.random() * 100000);
  }
  return res;
}
