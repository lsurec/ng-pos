import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationsService } from 'src/app/services/notifications.service';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { ProductRestaurantInterface } from '../../interfaces/product-restaurant';

@Component({
  selector: 'app-image-restaurant',
  templateUrl: './image-restaurant.component.html',
  styleUrls: ['./image-restaurant.component.scss']
})
export class ImageRestaurantComponent {

  isLoading: boolean = false;

  urlImg: string = "";

  constructor(
    public restaurantService: GlobalRestaurantService,
    public dialogRef: MatDialogRef<ImageRestaurantComponent>,
    @Inject(MAT_DIALOG_DATA) public producto: ProductRestaurantInterface,
    private _notificationService: NotificationsService,
  ) {

    this.urlImg = producto.objeto_Imagen ?? "";
  }


  loadData() { }


  closeDialog() {

    this.dialogRef.close();
  }

}
