import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
} from '@angular/core';
import { TruckService } from '../services/truck.service';
import { PreHireChecklistModel } from '../models/pre-hire-checklist.model';
import { NgForOf, NgIf } from '@angular/common';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
  selector: 'app-pre-hire-checklist',
  imports: [NgForOf, NgIf, MatRadioButton, MatRadioGroup],
  templateUrl: './pre-hire-checklist.component.html',
  styleUrl: './pre-hire-checklist.component.scss',
})
export class PreHireChecklistComponent implements OnInit, OnChanges {
  @Input() singleTruckId: number;
  @Input() saveButtonEnabled = false;
  preHireCheckList: PreHireChecklistModel[] = [];
  @Output() preHireCheckListObject = new EventEmitter<any>();
  @Input() isDisabled = false;

  constructor(private service: TruckService) {}

  ngOnInit(): void {}

  ngOnChanges(simpleChanges: any) {
    if (simpleChanges.object?.currentValue) {
      this.setPreHireCheckList();
    } else if (
      this.object == null &&
      simpleChanges.passedCheckList?.currentValue == '0'
    ) {
      this.getPreHireChecklist();
    }
  }

  private getPreHireChecklist() {
    this.preHireCheckList = [];
    this.service.getPreHireChecklist().subscribe((res: any) => {
      res.data.forEach(item => {
        // categories by category
        if (
          !this.preHireCheckList.find(x => x.categoryName === item.category)
        ) {
          this.preHireCheckList.push({
            categoryName: item.category,
            items: [
              {
                id: item.id,
                name: item.name,
                status: item.status,
                category: item.category,
                checklistId: item.id,
              },
            ],
          });
        } else {
          // items by category
          this.preHireCheckList.forEach(category => {
            if (category.categoryName === item.category) {
              // check if item already exists
              const itemExists = category.items.find(x => x.id === item.id);
              if (!itemExists) {
                category.items.push({
                  id: item.id,
                  name: item.name,
                  status: item.status,
                  category: item.category,
                  checklistId: item.id,
                });
              } else {
                itemExists.status = item.status;
              }
            }
          });
        }
      });
    });
  }

  onChange($event: any, id: number, position: number) {
    this.preHireCheckList.forEach(items => {
      items.items?.forEach(item => {
        this.shareObject[position] = $event.value;
      });
    });
    this.preHireCheckListObject.emit(this.shareObject);
  }

  @Input() object!: any;
  shareObject: any = {};
  @Input() passedCheckList = '0';

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
    this.object.forEach(item => {
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
}
