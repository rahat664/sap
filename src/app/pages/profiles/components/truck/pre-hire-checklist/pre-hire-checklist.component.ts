import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TruckService} from "../services/truck.service";
import {PreHireChecklistModel} from "../models/pre-hire-checklist.model";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-pre-hire-checklist',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './pre-hire-checklist.component.html',
  styleUrl: './pre-hire-checklist.component.scss'
})
export class PreHireChecklistComponent implements OnInit {
  preHireCheckList: PreHireChecklistModel[] = [];
  object: any={};
  @Output() preHireCheckListObject: EventEmitter<any> = new EventEmitter();

  constructor(private service: TruckService) {
  }

  ngOnInit(): void {
    this.getPreHireChecklist();
  }

  private getPreHireChecklist() {
    this.service.getPreHireChecklist().subscribe((res: any) => {
      this.preHireCheckList = res.data;
    });
  }

  onChange($event: any, id: number) {
    this.preHireCheckList.forEach((item) => {
      if (item.id === id){
        this.object[item.id] = $event.target.value;
      }
    });
  }

  protected readonly onclick = onclick;

  onclickSave() {
    this.preHireCheckListObject.emit(this.object);
  }
}
