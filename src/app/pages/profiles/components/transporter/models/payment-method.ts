import {CustomInputSelectModel} from "../../../../../shared/modules/custom-input/custom-input-select.model";

export const paymentMethod: CustomInputSelectModel[] = [
  {id:1, value: 'Bank', selected: false},
  {id:2, value: 'Bkash', selected: false},
  {id:3, value: 'Cash', selected: false},
]

export const bkashPaymentMethod: CustomInputSelectModel[] = [
  {id:1, value: 'Personal', selected: false},
  {id:2, value: 'Agent', selected: false},
]
