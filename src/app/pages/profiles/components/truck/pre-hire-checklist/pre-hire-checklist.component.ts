import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TruckService } from '../services/truck.service';
import { PreHireChecklistModel } from '../models/pre-hire-checklist.model';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-pre-hire-checklist',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './pre-hire-checklist.component.html',
  styleUrl: './pre-hire-checklist.component.scss',
})
export class PreHireChecklistComponent implements OnInit {
  @Input() singleTruckId: number;
  @Input() saveButtonEnabled = false;
  preHireCheckList: PreHireChecklistModel[] = [];
  object: any = {};
  @Output() preHireCheckListObject = new EventEmitter<any>();

  constructor(private service: TruckService) {}

  ngOnInit(): void {
    const singleTruck = localStorage.getItem('truck');
    if (singleTruck && !this.saveButtonEnabled) {
      this.getPreHireChecklistByTruckId(JSON.parse(singleTruck).id);
    } else {
      this.getPreHireChecklist();
    }
  }

  ngOnChanges(simpleChanges: any) {
    const singleTruck = localStorage.getItem('truck');
    if (simpleChanges.singleTruckId) {
      this.getPreHireChecklistByTruckId(JSON.parse(singleTruck).id);
    } else {
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

  onChange($event: any, id: number) {
    this.preHireCheckList.forEach(items => {
      items.items.forEach(item => {
        if (item.id === id) {
          this.object[item.id] = $event.target.value;
        }
      });
    });
    this.preHireCheckListObject.emit(this.object);
  }

  protected readonly onclick = onclick;

  getPreHireChecklistByTruckId(truckId: number) {
    this.preHireCheckList = [];
    this.service.getPreHireChecklist(truckId).subscribe((res: any) => {
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
              },
            ],
          });
          localStorage.removeItem('truck');
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

  getChecklistPosition(i: number, j: number) {
    if (i == 0) {
      return `${j + 1}`;
    } else {
      this.preHireCheckList.forEach((category, index) => {
        if (index < i) {
          j += category.items.length;
        }
      });
      return `${j + 1}`;
    }
  }
}
