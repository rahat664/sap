import { ActionReducer, MetaReducer } from '@ngrx/store';

export function rehydrateReducer(
  reducer: ActionReducer<any>
): ActionReducer<any> {
  return function (state, action) {
    const newState = reducer(state, action);
    const user = localStorage.getItem('user');

    if (user) {
      return {
        ...newState,
        auth: {
          ...newState.auth,
          user: JSON.parse(user),
          loading: false, // Ensure loading is false on rehydration
        },
      };
    }

    return newState;
  };
}

export const metaReducers: MetaReducer<any>[] = [rehydrateReducer];
