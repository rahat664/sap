import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../../services/user.service";
import {ToastrService} from "ngx-toastr";
import {UserModel} from "../../../../user-management/models/user.model";
import {paymentMethod} from "../models/payment-method";
import {CustomInputSelectModel} from "../../../../../shared/modules/custom-input/custom-input-select.model";

@Component({
  selector: 'app-transporter-add',
  standalone: true,
    imports: [
        CustomInputComponent,
        GetClickEventDirective,
        ReactiveFormsModule
    ],
  templateUrl: './transporter-add.component.html',
  styleUrl: './transporter-add.component.scss'
})
export class TransporterAddComponent implements OnInit{
  transporterForm: FormGroup;
  transporterModel: UserModel = new UserModel();
  paymentOpened: boolean;
  paymentOptionsArray: CustomInputSelectModel[] = paymentMethod;
  paymentInputPlaceholder: string;
  @Output() formCreated = new EventEmitter<boolean>();

  constructor(private service: UserService, private toastr: ToastrService, private fb: FormBuilder) {
    this.transporterForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      truckStand: [''],
      preferredPaymentMethod: [''],
      role: [''],
      note: ['']
    });
  }

  onSave() {
    if (this.transporterForm.valid) {
      this.transporterModel.name = this.transporterForm.get('name').value;
      this.transporterModel.phone = this.transporterForm.get('phone').value;
      this.transporterModel.note = this.transporterForm.get('note').value;
      this.transporterModel.role = 'Transporter';
      this.service.addUser(this.transporterModel).subscribe(
        res => {
          this.toastr.success('Transporter added successfully');
          this.formCreated.emit(true);
        },
        error => {
          this.toastr.error('Failed to add transporter');
        }
      )
    }
  }

  ngOnInit(): void {
  }

  onClickPayment($event: boolean) {
    this.paymentOpened = $event;
  }

  onSelectPayment($event: number) {
    // this.transporterForm.get('preferredPaymentMethod').setValue($event);
    this.paymentInputPlaceholder = this.paymentOptionsArray.find(item => item.id === $event).value;
  }
}
