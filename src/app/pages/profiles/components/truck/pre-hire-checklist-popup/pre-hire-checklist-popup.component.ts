import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { NgForOf } from '@angular/common';
import { PreHireChecklistModel } from '../models/pre-hire-checklist.model';
import { TruckService } from '../services/truck.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { GetElementHeightDirective } from '../../../../../shared/directive/get-element-height.directive';

@Component({
  selector: 'app-pre-hire-checklist-popup',
  standalone: true,
  imports: [NgForOf, MatRadioButton, MatRadioGroup, GetElementHeightDirective],
  templateUrl: './pre-hire-checklist-popup.component.html',
  styleUrl: './pre-hire-checklist-popup.component.scss',
})
export class PreHireChecklistPopupComponent {
  @Input() singleTruckId: number;
  @Input() saveButtonEnabled = false;
  preHireCheckList: PreHireChecklistModel[] = [];
  @Input() object!: any;
  shareObject: any = {};
  @Output() preHireCheckListObject = new EventEmitter<any>();
  passedCheckList: string = '0';
  width: string = '0px';

  constructor(
    private service: TruckService,
    public dialogRef: MatDialogRef<PreHireChecklistPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.setPreHireCheckList();
  }

  onChange($event: any, id: number, position: number) {
    this.preHireCheckList.forEach(items => {
      items.items.forEach(item => {
        this.shareObject[position] = $event.value;
      });
    });
  }

  getChecklistPosition(i: number, j: number) {
    if (i == 0) {
      return j + 1;
    } else {
      this.preHireCheckList.forEach((category, index) => {
        if (index < i) {
          j += category.items.length;
        }
      });
      return j + 1;
    }
  }

  private setPreHireCheckList() {
    this.preHireCheckList = [];
    this.data?.checklist?.forEach(item => {
      // categories by category
      if (!this.preHireCheckList.find(x => x.categoryName === item.category)) {
        this.preHireCheckList.push({
          categoryName: item.category,
          items: [
            {
              id: item.id,
              name: item.name,
              status: item.status,
              category: item.category,
              checklistId: item.checklistId,
            },
          ],
        });
      } else {
        // items by category
        this.preHireCheckList.forEach(category => {
          if (category.categoryName === item.category) {
            category.items.push({
              id: item.id,
              name: item.name,
              status: item.status,
              category: item.category,
              checklistId: item.checklistId,
            });
          }
        });
      }
    });
  }

  onSubmit() {
    this.dialogRef.close(this.shareObject);
  }

  closePopup() {
    this.dialogRef.close();
  }

  getWidth($event: any) {
  }
}
