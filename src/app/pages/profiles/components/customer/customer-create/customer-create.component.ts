import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {CustomerCreateModel} from "../model/customer-create.model";
import {UserService} from "../../../services/user.service";
import {ToastrService} from "ngx-toastr";
import {Subscription} from "rxjs";
import {CustomerService} from "../../../services/customer.service";
import {ConvertToFormdataService} from "../../../../../shared/services/convert-to-formdata/convert-to-formdata.service";

@Component({
  selector: 'app-customer-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './customer-create.component.html',
  styleUrl: './customer-create.component.scss'
})
export class CustomerCreateComponent implements OnInit, OnDestroy{
  customerForm: FormGroup;
  customerModel = new CustomerCreateModel()
  private subs: Subscription;
  @Output() formCreated : EventEmitter<boolean> = new EventEmitter<boolean>(false)

  constructor(private fb: FormBuilder, private service: CustomerService, private toastr: ToastrService, private formData: ConvertToFormdataService) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      email: [''],
      phone: ['', Validators.required],
      contactPerson: ['', Validators.required],
      address: [''],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.subs = this.customerForm.get('name').valueChanges.subscribe((value)=> {
      let fourDigitName = ""
      fourDigitName = value.toString().substring(0,4).toUpperCase()
      this.customerForm.get('code').setValue(fourDigitName)
    })
  }

  onSave() {
    if (this.customerForm.valid) {
      this.customerModel.name = this.customerForm.get('name').value;
      this.customerModel.customerCode = this.customerForm.get('code').value;
      this.customerModel.contact_person = this.customerForm.get('contactPerson').value;
      this.customerModel.phone = this.customerForm.get('phone').value;
      this.customerModel.email = this.customerForm.get('email').value;
      this.customerModel.address = this.customerForm.get('address').value;
      this.customerModel.note = this.customerForm.get('note').value;
      this.customerModel.role = 'Customer';
      this.service.customerCodeValidation(this.customerModel.customerCode).subscribe((res:any)=> {
        if (res.data.validation == 'Failed') {
          this.subs.unsubscribe();
          this.customerForm.get('code').setValue(res.data.Suggestion)
          this.customerModel.customerCode = res.data.Suggestion
          this.submitCustomer()
        } else  {
          this.submitCustomer()
        }
      })
    } else {
      this.customerForm.markAllAsTouched();
    }
  }

  private submitCustomer() {
    this.service.addCustomer(this.customerModel).subscribe((res: any)=> {
        if (res.status == 'OK') {
          this.toastr.success(res.message)
          this.customerForm.reset()
          this.formCreated.emit(true);
        } else {
          this.toastr.error(res.error.message)
          this.formCreated.emit(true);
        }
      },
      (error: any)=> {
        this.toastr.error(error.error.message)
      }

    )
  }

  ngOnDestroy(): void {
    this.customerForm.reset()
  }
}
