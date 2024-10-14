import { Component, Inject } from '@angular/core';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-error-comanda',
  templateUrl: './error-comanda.component.html',
  styleUrls: ['./error-comanda.component.scss']
})
export class ErrorComandaComponent {

  isLoading: boolean = false;
  error: string = "No se pudo imprimir";

  constructor(
    public restaurantService: GlobalRestaurantService,
    public dialogRef: MatDialogRef<ErrorComandaComponent>,
    @Inject(MAT_DIALOG_DATA) public errorComanda: any,
  ) {

    this.error = errorComanda;

  }


  closeDialog() {
    this.dialogRef.close();
  }


}
