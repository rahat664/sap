export interface EventData {
  tripPointId: number | null;
  eventTypeId: number;
  eventType: string;
  eventName: string;
  localDateTime: string | null;
  note: string | null;
  tripDocuments: tripDocument[];
}

export interface EventResponse {
  status: string;
  statusCode: number;
  message: string;
  data: EventData[];
}

export interface tripDocument {
  id: number;
  url: string;
  documentStatus: string;
}
