export interface EventData {
  tripPointId: number | null;
  eventTypeId: number;
  eventType: string;
  eventName: string;
  localDateTime: string | null;
  notes: Notes[];
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

export interface Notes {
  lcNumber: any;
  id: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}
