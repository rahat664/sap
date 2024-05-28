import {Component, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit{
  constructor(private service: UserService) { }
  ngOnInit(): void {
    this.getCustomer();
  }

  getCustomer() {
    this.service.getUser('Customer').subscribe((res) => {
      console.log(res);
    });
  }

}
