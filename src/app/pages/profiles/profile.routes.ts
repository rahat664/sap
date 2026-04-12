import { Routes } from '@angular/router';
import { transporterResolver } from '../../core/resolver/transporter.resolver';
import { customerResolver } from '../../core/resolver/customer.resolver';
import { truckResolver } from '../../core/resolver/truck.resolver';
import { driverResolver } from '../../core/resolver/driver.resolver';
import { trackerResolver } from '../../core/resolver/tracker.resolver';
import { enterpriseGuard } from '../auth/guards/enterprise.guard';

export const profileRoutes: Routes = [
  {
    path: '',
    redirectTo: 'customer',
    pathMatch: 'full',
  },
  {
    path: 'customer',
    title: 'Customer',
    loadComponent: () =>
      import('./components/customer/customer.component').then(
        c => c.CustomerComponent
      ),
    canActivate: [enterpriseGuard],
    resolve: {
      customer: customerResolver,
    },
  },
  {
    path: 'customer/:customerCode/details',
    title: 'Customer Details',
    loadComponent: () =>
      import(
        './components/customer/customer-details/customer-details.component'
      ).then(c => c.CustomerDetailsComponent),
  },
  {
    path: 'transporter',
    title: 'Transporter',
    loadComponent: () =>
      import('./components/transporter/transporter.component').then(
        c => c.TransporterComponent
      ),
    resolve: {
      transporter: transporterResolver,
    },
  },

  {
    path: 'transporter/add',
    title: 'Add Transporter',
    loadComponent: () =>
      import('./components/transporter/transporter-add/transporter-add.component').then(
        c => c.TransporterAddComponent
      ),
  },
  {
    path: 'transporter/:id/details',
    title: 'Transporter Details',
    loadComponent: () =>
      import(
        './components/transporter/transporter-details/transporter-details.component'
      ).then(c => c.TransporterDetailsComponent),
  },
  {
    path: 'vehicle',
    title: 'Truck',
    loadComponent: () =>
      import('./components/truck/truck.component').then(c => c.TruckComponent),
    resolve: {
      truck: truckResolver,
    },
  },
  {
    path: 'truck/add',
    title: 'Add Truck',
    loadComponent: () =>
      import('./components/truck/old-truck-add/old-truck-add.component').then(
        c => c.OldTruckAddComponent
      ),
  },
  {
    path: 'truck/:id/details',
    title: 'Truck Details',
    loadComponent: () =>
      import('./components/truck/truck-details/truck-details.component').then(
        c => c.TruckDetailsComponent
      ),
  },
  {
    path: 'truck/report',
    title: 'Report',
    loadComponent: () =>
      import('./components/truck/report/report.component').then(
        c => c.ReportComponent
      ),
  },
  {
    path: 'truck/:id/pre-hire-checklist',
    title: 'Pre Hire Checklist',
    loadComponent: () =>
      import(
        './components/truck/pre-hire-checklist/pre-hire-checklist.component'
      ).then(c => c.PreHireChecklistComponent),
  },
  {
    path: 'driver',
    title: 'Driver',
    loadComponent: () =>
      import('./components/driver/driver.component').then(
        c => c.DriverComponent
      ),
    resolve: {
      driver: driverResolver,
    },
  },
  {
    path: 'driver/add',
    title: 'Add Driver',
    loadComponent: () =>
      import('./components/driver/driver-add/driver-add.component').then(
        c => c.DriverAddComponent
      ),
  },
  {
    path: 'driver/:id/details',
    title: 'Driver Details',
    loadComponent: () =>
      import(
        './components/driver/driver-details/driver-details.component'
      ).then(c => c.DriverDetailsComponent),
  },
  {
    path: 'tracker',
    title: 'Tracker',
    loadComponent: () =>
      import('./components/tracker/tracker.component').then(
        c => c.TrackerComponent
      ),
    resolve: {
      tracker: trackerResolver,
    },
  },
  {
    path: 'tracker/add',
    title: 'Add Tracker',
    loadComponent: () =>
      import('./components/tracker/add-tracker/add-tracker.component').then(
        c => c.AddTrackerComponent
      ),
  },
  {
    path: 'tracker/:id/edit',
    title: 'Edit Tracker',
    loadComponent: () =>
      import('./components/tracker/edit-tracker/edit-tracker.component').then(
        c => c.EditTrackerComponent
      ),
  },
  {
    path: 'document-viewer',
    title: 'Document Viewer',
    loadComponent: () =>
      import('./components/document-viewer/document-viewer.component').then(
        c => c.DocumentViewerComponent
      ),
  },
  {
    path: 'document-upload',
    title: 'Document Upload',
    loadComponent: () =>
      import('./components/document-upload/document-upload.component').then(
        c => c.DocumentUploadComponent
      ),
  }
];
