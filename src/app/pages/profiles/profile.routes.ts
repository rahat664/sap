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
  },
  {
    path: 'truck/add',
    title: 'Add Truck',
    loadComponent: () => import('./components/truck/truck-add/truck-add.component').then(c => c.TruckAddComponent)
  },
  {
    path: 'truck/:id/details',
    title: 'Truck Details',
    loadComponent: () => import('./components/truck/truck-details/truck-details.component').then(c => c.TruckDetailsComponent)
  },
  {
    path: 'truck/:id/pre-hire-checklist',
    title: 'Pre Hire Checklist',
    loadComponent: () => import('./components/truck/pre-hire-checklist/pre-hire-checklist.component').then(c => c.PreHireChecklistComponent)
  },
  {
    path: 'driver',
    title: 'Driver',
    loadComponent: () => import('./components/driver/driver.component').then(c => c.DriverComponent)
  },
  {
    path: 'driver/add',
    title: 'Add Driver',
    loadComponent: () => import('./components/driver/driver-add/driver-add.component').then(c => c.DriverAddComponent)
  },
  {
    path: 'driver/:id/details',
    title: 'Driver Details',
    loadComponent: () => import('./components/driver/driver-details/driver-details.component').then(c => c.DriverDetailsComponent)
  }
]
