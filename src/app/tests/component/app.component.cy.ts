// Optimized and reusable Cypress component test for AppComponent
import { AppComponent } from '../../app.component';
import { AuthService } from '../../pages/auth/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { GeolocationService } from '../../shared/services/location/geolocation.service';

// Setup function to mount AppComponent with necessary providers
const mountAppComponent = () => {
  return cy.mount(AppComponent, {
    imports: [HttpClientModule], // HttpClientModule includes HttpClient, HttpHandler, and HttpBackend
    providers: [AuthService, GeolocationService],
  });
};

describe('AppComponent', () => {
  beforeEach(() => {
    // Common setup can be done here if needed
    cy.log('Starting test...');
  });

  it('should create the app', () => {
    mountAppComponent().then(component => {
      expect(component).to.exist;
    });
  });

  it('should have a title', () => {
    mountAppComponent().then(component => {
      expect(component.component.title).to.equal('snz-web');
    });
  });
});
