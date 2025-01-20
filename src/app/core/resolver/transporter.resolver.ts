import { ResolveFn } from '@angular/router';

export const transporterResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
