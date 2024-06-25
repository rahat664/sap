import {TruckInnerModel} from "./truck-inner.model";

export interface TruckModel {
  id: number;
  truck: TruckInnerModel;
  preHireChecklistList: number;
  noOfTrips: number;
}
