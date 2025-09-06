export type GymInfo = {
  name: string;
  region: string;
  gymCurrent: number;
  gymMax: number;
};

export type Source = {
  name: string;
  url: string;
  parse: (data: any) => GymInfo[];
};
