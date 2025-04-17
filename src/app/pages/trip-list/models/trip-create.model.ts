export class Point {
  pointDistrict: string;
  pointName: string;
  pointLat: number;
  pointLon: number;
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
  paymentType: string;
  points: Point[];
  tripType: string;
}
