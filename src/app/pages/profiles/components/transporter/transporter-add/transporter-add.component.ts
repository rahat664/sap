import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../../services/user.service";
import {ToastrService} from "ngx-toastr";
import {UserModel} from "../../../../user-management/models/user.model";
import {bkashPaymentMethod, paymentMethod} from "../models/payment-method";
import {CustomInputSelectModel} from "../../../../../shared/modules/custom-input/custom-input-select.model";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-transporter-add',
  standalone: true,
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    ReactiveFormsModule,
    NgIf
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
  bkashPaymentTypePlaceholder: string;

  constructor(private service: UserService, private toastr: ToastrService, private fb: FormBuilder) {
    this.transporterForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      truckStand: [''],
      preferredPaymentMethod: [''],
      bkashName: [null],
      bkashNumber: [null],
      bkashType: [null],
      bankName: [null],
      bankBranch: [null],
      bankAccountName: [null],
      bankAccountNumber: [null],
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
      this.transporterModel.truckStand = this.transporterForm.get('truckStand').value;
      this.transporterModel.paymentMethod = this.transporterForm.get('preferredPaymentMethod').value;
      switch (this.transporterModel.paymentMethod) {
        case 'Bkash':
          this.transporterModel.acc_holder_name = this.transporterForm.get('bkashName').value;
          this.transporterModel.bank_acc_no = this.transporterForm.get('bkashNumber').value;
          this.transporterModel.acc_type = this.transporterForm.get('bkashType').value;
          this.transporterModel.bank_name = null;
          this.transporterModel.branch_name = null;
          this.transporterForm.patchValue({
            bankName: null,
            bankBranch: null,
            bankAccountName: null,
            bankAccountNumber: null
          });
          break;
        case 'Bank':
          this.transporterModel.acc_holder_name = this.transporterForm.get('bankAccountName').value;
          this.transporterModel.bank_acc_no = this.transporterForm.get('bankAccountNumber').value;
          this.transporterModel.acc_type = null;
          this.transporterModel.bank_name = this.transporterForm.get('bankName').value;
          this.transporterModel.branch_name = this.transporterForm.get('bankBranch').value;
          this.transporterForm.patchValue({
            bkashName: null,
            bkashNumber: null,
            bkashType: null
          });
          break;
        default:
          this.transporterModel.acc_holder_name = null;
          this.transporterModel.bank_acc_no = null;
          this.transporterModel.acc_type = null;
          this.transporterModel.bank_name = null;
          this.transporterModel.branch_name = null;
          this.transporterForm.patchValue({
            bankName: null,
            bankBranch: null,
            bankAccountName: null,
            bankAccountNumber: null,
            bkashName: null,
            bkashNumber: null,
            bkashType: null
          })
          break;
      }
      this.service.addUserFromTransport(this.transporterModel).subscribe(
        (res: any) => {
          if (res.status == 'OK') {
            this.toastr.success(res.message);
            this.formCreated.emit(true);
            this.transporterForm.reset();
          } else {
            this.toastr.error(res.message);
            this.formCreated.emit(false);
          }
        },
        error => {
          this.toastr.error('Something went wrong');
          this.formCreated.emit(false);
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
    this.paymentOpened = false;
    this.paymentOptionsArray.forEach(item => item.selected = item.id === $event);
    this.transporterForm.patchValue({
      preferredPaymentMethod: this.paymentInputPlaceholder
    });
  }

  protected readonly bkashPaymentMethod = bkashPaymentMethod;
  bkashOpened: boolean;

  onClickBkashType($event: boolean) {
    this.bkashOpened = $event;
  }

  onSelectBkashType($event: number) {
    this.bkashPaymentTypePlaceholder = this.bkashPaymentMethod.find(item => item.id === $event).value;
    this.bkashOpened = false;
    this.bkashPaymentMethod.forEach(item => item.selected = item.id === $event);
    this.transporterForm.patchValue({
      bkashType: this.bkashPaymentTypePlaceholder
    });
  }
}
