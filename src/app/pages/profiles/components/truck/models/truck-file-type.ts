export const truckFileType: TruckFileType[] = [
  {
    id: 1,
    name: 'Truck images',
    max: 10,
    expiryAvailable: false,
    uploaded: true,
  },
  {
    id: 2,
    name: 'Registration paper',
    max: 2,
    expiryAvailable: false,
    uploaded: false,
  },
  {
    id: 3,
    name: 'Fitness certificate',
    max: 2,
    expiryAvailable: true,
    uploaded: true,
  },
  {
    id: 4,
    name: 'Route permit',
    max: 2,
    expiryAvailable: true,
    uploaded: false,
  },
  {
    id: 5,
    name: 'Tax paper',
    max: 2,
    expiryAvailable: true,
    uploaded: true,
  },
  {
    id: 6,
    name: 'Insurance paper',
    max: 2,
    expiryAvailable: true,
    uploaded: false,
  },
  {
    id: 7,
    name: 'Case paper',
    max: 2,
    expiryAvailable: true,
    uploaded: true,
  },
  {
    id: 8,
    name: 'Others document',
    max: 2,
    expiryAvailable: false,
    uploaded: false,
  },
];

export interface TruckFileType {
  id: number;
  name: string;
  max: number;
  expiryAvailable: boolean;
  uploaded: boolean;
}
