export class Point {
  pointDistrict: string;
  pointName: string;
  pointLat: string;
  pointLon: string;
  pointType: string;
}

export class TripCreate {
  customerCode: string;
  tripStartDatetime: string;
  categoryId: string;
  numOfTrucks: string;
  truckSize: string;
  truckCapacityInTon: string;
  goodsId: string;
  goodsName: string;
  customerRate: number;
  truckId: string;
  note: string;
  points: Point[];
}
