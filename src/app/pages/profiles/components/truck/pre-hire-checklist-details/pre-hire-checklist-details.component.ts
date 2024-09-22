import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { PreHireChecklistModel } from '../models/pre-hire-checklist.model';
import { TruckService } from '../services/truck.service';

@Component({
  selector: 'app-pre-hire-checklist-details',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './pre-hire-checklist-details.component.html',
  styleUrl: './pre-hire-checklist-details.component.scss',
})
export class PreHireChecklistDetailsComponent {
  preHireCheckList: PreHireChecklistModel[] = [];
  @Input() object: any[] = [];

  constructor(private service: TruckService) {}

  ngOnChanges(simpleChanges: any) {
    if (simpleChanges.object) {
      this.object?.forEach(item => {
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
              category.items.push({
                id: item.id,
                name: item.name,
                status: item.status,
                category: item.category,
              });
            }
          });
        }
      });
    }
  }

  protected readonly onclick = onclick;

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
