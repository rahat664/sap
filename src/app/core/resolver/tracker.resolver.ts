import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TrackerService } from '../../pages/profiles/services/tracker.service';
import { inject } from '@angular/core';

export const trackerResolver: ResolveFn<Observable<any>> = (route, state) => {
  const page = 0;
  const size = 20;
  const trackerService = inject(TrackerService);

  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return trackerService.getTrackers(page, size).pipe(
        map(data => {
          return {
            loading: false,
            data,
          };
        }),
        catchError(error => {
          console.error('Error in tracker resolver', error);
          return of({
            loading: false,
            error: true,
            message: 'Error in tracker resolver',
          });
        })
      );
    })
  );
};
