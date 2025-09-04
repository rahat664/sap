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
import { GetElementHeightDirective } from '../../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../../shared/directive/give-max-height.directive';

@Component({
  selector: 'app-pre-hire-checklist',
  imports: [
    MatRadioButton,
    MatRadioGroup,
    NgForOf,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
  ],
  templateUrl: './pre-hire-checklist.component.html',
  styleUrl: './pre-hire-checklist.component.scss',
})
export class PreHireChecklistComponent implements OnInit, OnChanges {
  @Input() singleTruckId: number;
  @Input() saveButtonEnabled = false;
  @Input() heightFromParentMenu = '0px';
  preHireCheckList: PreHireChecklistModel[] = [];
  @Output() preHireCheckListObject = new EventEmitter<any>();
  @Input() isDisabled = false;

  constructor(private service: TruckService) {}

  ngOnInit(): void {}

  ngOnChanges(simpleChanges: any) {
    console.log(this.heightFromParentMenu);
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
  firstItemHeight: string = '0px';
  tableHeaderHeight: string = '0px';

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

  calculateOtherItemsHeight() {
    // calculate height of firstItemHeight and tableHeaderHeight and parent height be sure to remove px from string
    const parentHeight = parseInt(this.heightFromParentMenu.replace('px', ''));
    const firstItemHeight = parseInt(this.firstItemHeight.replace('px', ''));
    const tableHeaderHeight = parseInt(
      this.tableHeaderHeight.replace('px', '')
    );
    console.log(
      firstItemHeight,
      this.firstItemHeight,
      tableHeaderHeight,
      parentHeight
    );
    return parentHeight + firstItemHeight + tableHeaderHeight + 100 + 'px';
  }
}
