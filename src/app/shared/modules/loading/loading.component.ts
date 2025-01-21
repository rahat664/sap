import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loading',
  imports: [NgIf],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {}
