import { Component } from '@angular/core';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-select-check',
  templateUrl: './select-check.component.html',
  styleUrls: ['./select-check.component.scss']
})
export class SelectCheckComponent {


  isLoading: boolean = false;

  constructor(
    public restaurantService: GlobalRestaurantService,
    public dialogRef: MatDialogRef<SelectCheckComponent>,

  ) { }


  loadData() { }


  closeDialog() { }
}
