import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../profiles/services/user.service";
import {CustomInputSelectModel} from "../../../shared/modules/custom-input/custom-input-select.model";
import {CustomInputComponent} from "../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../shared/directive/get-click-event.directive";
import {UserModel} from "../models/user.model";
import {ToastrService} from "ngx-toastr";
import {roles} from "../models/role-file";

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
      phone: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(11), Validators.maxLength(11)]],
      email: ['', [Validators.required, Validators.email]],
      designation: [''],
      role: ['', [Validators.required]],
    });
  }

  onSave() {
    if (this.userForm.valid) {
      this.userModel.name = this.userForm.get('name').value;
      this.userModel.mobile = this.userForm.get('phone').value;
      this.userModel.email = this.userForm.get('email').value;
      this.userModel.role = this.userForm.get('role').value;
      this.userModel.designation = this.userForm.get('designation').value + '|' + this.roleInputPlaceholder;
      this.service.addUser(this.userModel).subscribe((res:any) => {
        this.formCreated.emit(true);
        if (res.status === 'OK') {
          this.userForm.reset();
          this.toastr.success('User created successfully');
        } else {
          this.toastr.error(res.message);
        }
      });
    }
  }

  ngOnInit(): void {
    // this.getRoleList();
  }

  // private getRoleList() {
  //   this.service.getUserRoles().subscribe((res: any) => {
  //     res.data.forEach((role: any) => {
  //       this.roleOptionsArray.push({id: role.id, value: role.name, selected: false})
  //     })
  //   });
  // }

  onClickRole($event: boolean) {
    this.roleOpened = $event;
  }

  onSelectRole($event: number) {
    this.roles.forEach((role) => {
      role.selected = role.id === $event;
    });
    this.roleInputPlaceholder = this.roles.find((role) => role.id === $event).value;
    this.roleOpened = false;
    this.userForm.get('role').setValue('Admin');
  }

  protected readonly roles = roles
}
