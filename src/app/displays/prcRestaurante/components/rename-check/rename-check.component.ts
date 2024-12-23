import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-rename-check',
  templateUrl: './rename-check.component.html',
  styleUrls: ['./rename-check.component.scss']
})
export class RenameCheckComponent {

  nombre: string = "";

  constructor(
    public dialogRef: MatDialogRef<RenameCheckComponent>,
    @Inject(MAT_DIALOG_DATA) public index: number,
    public restaurantService: GlobalRestaurantService,
    private _notificationService: NotificationsService,
    private translate: TranslateService,
  ) {
    this.nombre = restaurantService.orders[index].nombre;
  }

  cancelar() {
    this.dialogRef.close();
  }

  renombrar() {
    this.restaurantService.orders[this.index].nombre = this.nombre;
    this.dialogRef.close(this.nombre);
    this._notificationService.openSnackbar(this.translate.instant('pos.restaurante.cuenteRenombrada'));
  }

  //detectamos la tecla precionada
  @HostListener('document:keydown', ['$event'])
  //Manejo de eventos del declado
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log("Tecla presionada:", event.key);

    //si es enter guardar y validar el pin del mesero
    if (event.key.toLowerCase() === "enter") {
      //evita o bloquea la funcion que tiene por defecto
      event.preventDefault();
      //realiza la funcion que se necesite
      this.renombrar();
    }
  }

}
