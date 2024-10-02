import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogActionInterface } from 'src/app/interfaces/dialog-actions.interface';
import { RestaurantService } from '../../services/global-restaurat.service';

@Component({
  selector: 'app-pin-mesero',
  templateUrl: './pin-mesero.component.html',
  styleUrls: ['./pin-mesero.component.scss']
})
export class PinMeseroComponent {


  constructor(
    //Declaracion de variables privadas
    private translate: TranslateService,
    public dialogRef: MatDialogRef<PinMeseroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogActionInterface,
    public restaurantService: RestaurantService,
  ) {

  }

  guardar() {

  }
  
  cancelar() {

  }

}
