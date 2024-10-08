import { Component } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-details-product',
  templateUrl: './details-product.component.html',
  styleUrls: ['./details-product.component.scss'],
  providers: [],
})
export class DetailsProductComponent {

  isLoading: boolean = false;
  cantidad: number = 1;

  constructor(
    private notificationService: NotificationsService,
    public restaurantService: GlobalRestaurantService,
    public dialogRef: MatDialogRef<DetailsProductComponent>,
  ) {



  }

  changeSerie() { }

  changeBodega() { }
  changePrice() { }
  enviar() { }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  restar() {

    //disminuir cantidad en 1
    this.cantidad--;

    //si es menor o igual a cero, volver a 1 y mostrar
    if (this.cantidad <= 0) {
      this.cantidad = 1;
    }
  }


  sumar() {
    this.cantidad++;
  }

  changeCantidad() { }

  validarNumeros(event: any) {
    // Obtener el código de la tecla presionada
    let codigoTecla = event.which ? event.which : event.keyCode;

    // Permitir solo números (códigos de tecla entre 48 y 57 son números en el teclado)
    if (codigoTecla < 48 || codigoTecla > 57) {
      event.preventDefault();
    }
  }

}
