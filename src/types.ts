export type GymInfo = {
  name: string;
  region: string;
  gymCurrent: number;
  gymMax: number;
};

export type Source = {
  name: string;
  url: string;
  method: "GET" | "POST";
  parse: (data: any) => GymInfo[];
};
