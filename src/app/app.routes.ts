import { Routes } from '@angular/router';
import { authGuard } from './pages/auth/guards/auth.guard';
import { isAlreadyLoggedInGuard } from './pages/auth/guards/is-already-logged-in.guard';
import { roleGuard } from './pages/auth/guards/role.guard';
import { customerGuard } from './pages/auth/guards/customer.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'Login',
    loadComponent: () =>
      import('./pages/auth/components/sign-in/sign-in.component').then(
        c => c.SignInComponent
      ),
    canActivate: [isAlreadyLoggedInGuard],
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        c => c.DashboardComponent
      ),
    canActivate: [authGuard, roleGuard],
  },{
    path: 'challan-management',
    title: 'Challan Dashboard',
    loadComponent: () =>
      import('./pages/challan-dashboard/challan-dashboard.component').then(
        c => c.ChallanDashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'challan-management/:id/details',
    title: 'Challan Details',
    loadComponent: () =>
      import('./pages/challan-dashboard/components/challan-details/challan-details.component').then(
        c => c.ChallanDetailsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'challan-management/:id/image-upload',
    title: 'Challan Image Upload',
    loadComponent: () =>
      import('./pages/challan-dashboard/components/challan-image-upload/challan-image-upload.component').then(
        c => c.ChallanImageUploadComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'trip-list',
    title: 'Trip List',
    loadComponent: () =>
      import('./pages/trip-list/trip-list.component').then(
        c => c.TripListComponent
      ),
    canActivate: [authGuard],
  },{
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        c => c.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'trip-create/customerselection',
    title: 'Create Trip',
    loadComponent: () =>
      import('./pages/trip-list/components/new-trip/new-trip.component').then(
        c => c.NewTripComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'manage-trip',
    title: 'Manage Trip',
    loadComponent: () =>
      import('./pages/manage-trip/manage-trip.component').then(
        c => c.ManageTripComponent
      ),
    canActivate: [authGuard],
  },
  // create trip with query params not id with scenerio
  {
    path: 'trip-create/create',
    title: 'Create Trip',
    loadComponent: () =>
      import(
        './pages/trip-list/components/create-trip-page/create-trip-page.component'
      ).then(c => c.CreateTripPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'trip-create/overview',
    title: 'Create Trip',
    loadComponent: () =>
      import(
        './pages/trip-list/components/trip-create-overview/trip-create-overview.component'
      ).then(c => c.TripCreateOverviewComponent),
    canActivate: [authGuard],
  },
  {
    path: 'update-trip',
    title: 'Update Trip',
    loadComponent: () =>
      import(
        './pages/trip-list/components/trip-update/trip-update.component'
      ).then(c => c.TripUpdateComponent),
    canActivate: [authGuard],
  },
  {
    path: 'trip-create/create-trip-template',
    title: 'Create Trip',
    loadComponent: () =>
      import(
        './pages/trip-list/components/template-create/template-create.component'
      ).then(c => c.TemplateCreateComponent),
    canActivate: [authGuard],
  },
  {
    path: 'update-trip-template',
    title: 'Update Trip',
    loadComponent: () =>
      import(
        './pages/trip-list/components/template-update/template-update.component'
      ).then(c => c.TemplateUpdateComponent),
    canActivate: [authGuard],
  },
  {
    path: 'user-management',
    title: 'User Management',
    loadComponent: () =>
      import('./pages/user-management/user-management.component').then(
        c => c.UserManagementComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-management-customer',
    title: 'User Management',
    loadComponent: () =>
      import(
        './pages/user-management/user-management-customer-admin/user-management-customer-admin.component'
      ).then(c => c.UserManagementCustomerAdminComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    title: 'Profile',
    loadChildren: () =>
      import('./pages/profiles/profile.routes').then(m => m.profileRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'image-upload',
    title: 'Image Upload',
    loadComponent: () =>
      import('./shared/modules/global-image-upload/global-image-upload.component').then(
        m => m.GlobalImageUploadComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'image-details',
    title: 'Image Details',
    loadComponent: () =>
      import('./shared/modules/global-image-gallery/global-image-gallery.component').then(
        m => m.GlobalImageGalleryComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'about-us',
    title: 'About Us',
    loadComponent: () =>
      import('./pages/about-us/about-us.component').then(c => c.AboutUsComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
