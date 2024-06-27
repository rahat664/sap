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

  ngOnChanges() {
    this.getPreHireChecklistByTruckId(this.singleTruckId);
  }

  private getPreHireChecklist() {
    this.service.getPreHireChecklist().subscribe((res: any) => {
      this.preHireCheckList = res.data;
    });
  }

  onChange($event: any, id: number) {
    this.preHireCheckList.forEach(item => {
      if (item.id === id) {
        this.object[item.id] = $event.target.value;
      }
    });
  }

  protected readonly onclick = onclick;

  onclickSave() {
    this.preHireCheckListObject.emit(this.object);
  }

  getPreHireChecklistByTruckId(truckId: number) {
    this.service.getPreHireChecklist(truckId).subscribe((res: any) => {
      this.preHireCheckList = res.data;
    });
  }
}
