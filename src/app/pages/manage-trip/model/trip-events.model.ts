export interface EventData {
  tripPointId: number | null;
  eventTypeId: number;
  eventType: string;
  eventName: string;
  localDateTime: string | null;
  note: string | null;
  urls: string | null;
}

export interface EventResponse {
  status: string;
  statusCode: number;
  message: string;
  data: EventData[];
}
