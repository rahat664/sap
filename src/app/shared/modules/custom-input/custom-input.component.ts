import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CustomInputSelectModel} from "./custom-input-select.model";
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss'
})
export class CustomInputComponent implements OnInit{
  @Input() inputPlaceholder: string;
  @Output() selectedId: EventEmitter<number> = new EventEmitter();
  @Input() options: CustomInputSelectModel[] = [];
  itemsOpened: boolean = false;
  @Input() customOpened: any;

  ngOnInit(): void {
    document.querySelector('#customInputSelect').addEventListener('click', () => {
      this.itemsOpened = !this.itemsOpened;
    });
  }

  onClickOption(id: number) {
    this.selectedId.emit(id);
    this.itemsOpened = id === 99;
  }
}
