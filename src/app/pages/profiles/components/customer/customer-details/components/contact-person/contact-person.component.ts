import { Component, Input } from '@angular/core';
import { ContactPerson } from '../../../model/customer.model';

@Component({
  selector: 'app-contact-person',
  imports: [],
  templateUrl: './contact-person.component.html',
  styleUrl: './contact-person.component.scss'
})
export class ContactPersonComponent {
  @Input() contact!: ContactPerson;
}
