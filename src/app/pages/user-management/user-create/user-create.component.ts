import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../profiles/services/user.service";
import {CustomInputSelectModel} from "../../../shared/modules/custom-input/custom-input-select.model";
import {CustomInputComponent} from "../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../shared/directive/get-click-event.directive";
import {UserModel} from "../models/user.model";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    CustomInputComponent,
    GetClickEventDirective
  ],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;
  roleOptionsArray: CustomInputSelectModel[] = []

  @Input() isOpen: boolean = false;

  @Output() formCreated: EventEmitter<boolean> = new EventEmitter<boolean>(false)
  roleInputPlaceholder: string = '';
  roleOpened: boolean = false;
  userModel: UserModel = new UserModel();

  constructor(private service: UserService, private fb: FormBuilder, private toastr: ToastrService) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      designation: [''],
      role: ['', Validators.required],
    });
  }

  onSave() {
    if (this.userForm.valid) {
      this.userModel.name = this.userForm.get('name').value;
      this.userModel.phone = this.userForm.get('phone').value;
      this.userModel.email = this.userForm.get('email').value;
      this.userModel.role = this.userForm.get('role').value;
      this.service.addUser(this.userModel).subscribe((res:any) => {
        this.formCreated.emit(true);
        this.toastr.success('User Created Successfully');
      });
    }
  }

  ngOnInit(): void {
    this.getRoleList();
  }

  private getRoleList() {
    this.service.getUserRoles().subscribe((res: any) => {
      res.data.forEach((role: any) => {
        this.roleOptionsArray.push({id: role.id, value: role.name, selected: false})
      })
    });
  }

  onClickRole($event: boolean) {
    this.roleOpened = $event;
  }

  onSelectRole($event: number) {
    this.roleOptionsArray.forEach((role) => {
      role.selected = role.id === $event;
    });
    this.roleInputPlaceholder = this.roleOptionsArray.find((role) => role.id === $event).value;
    this.roleOpened = false;
    this.userForm.get('role').setValue(this.roleInputPlaceholder);
  }
}
