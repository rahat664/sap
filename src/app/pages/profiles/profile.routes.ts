import {Routes} from "@angular/router";

export const profileRoutes: Routes = [
  {
    path: '',
    redirectTo: 'customer',
    pathMatch: 'full'
  },
  {
    path: 'customer',
    title: 'Customer',
    loadComponent: () => import('./components/customer/customer.component').then(c => c.CustomerComponent)
  },
  {
    path: 'transporter',
    title: 'Transporter',
    loadComponent: () => import('./components/transporter/transporter.component').then(c => c.TransporterComponent)
  },
  {
    path: 'truck',
    title: 'Truck',
    loadComponent: () => import('./components/truck/truck.component').then(c => c.TruckComponent)
  }
]
