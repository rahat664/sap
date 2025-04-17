export class Point {
  pointDistrict: string;
  pointName: string;
  pointLat: number;
  pointLon: number;
  pointType: string;
}

export class TripTemplate {
  name: string;
  customerCode: string;
  categoryId: string;
  truckSize: string;
  numOfTrucks: string;
  truckCapacityInTon: string;
  goodsId: string;
  goodsName: string;
  customerRate: number;
  truckId?: string;
  note: string;
  paymentType: string;
  points: Point[];
  tripType: string;
}
