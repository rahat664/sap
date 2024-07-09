export interface Point {
  point_district: string;
  point_name: string;
  point_lat: string;
  point_lon: string;
  point_type: string;
}

export interface TripCreate {
  customer_code: string;
  trip_start_datetime: string;
  category_id: string;
  num_of_trucks: string;
  truck_size: string;
  truck_capacity_in_ton: string;
  goods_id: string;
  customerRate: number;
  truck_id: string;
  note: string;
  points: Point[];
}
