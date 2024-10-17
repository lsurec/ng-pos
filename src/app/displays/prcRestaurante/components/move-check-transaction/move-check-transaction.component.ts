import { Component } from '@angular/core';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderInterface } from '../../interfaces/order.interface';
import { GarnishTraInteface } from '../../interfaces/garnish.interface';
import { ProductRestaurantInterface } from '../../interfaces/product-restaurant';
import { ImageRestaurantComponent } from '../image-restaurant/image-restaurant.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-move-check-transaction',
  templateUrl: './move-check-transaction.component.html',
  styleUrls: ['./move-check-transaction.component.scss']
})
export class MoveCheckTransactionComponent {

  index: number = 0;

  constructor(
    public restaurantService: GlobalRestaurantService,
    private _dialog: MatDialog,
    private _translate: TranslateService,
    private _notificationService: NotificationsService,
  ) { }


  async newCheck() {
    let nombre: string = await this._notificationService.newCheck();

    if (nombre) {

      this.restaurantService.orders.push(
        {
          consecutivo: 0,
          consecutivoRef: 0,
          mesa: this.restaurantService.table!,
          mesero: this.restaurantService.waiter!,
          nombre: nombre,
          selected: false,
          transacciones: [],
          ubicacion: this.restaurantService.location!,
        }

      );

      this._notificationService.openSnackbar(this._translate.instant('pos.restaurante.cuentaCreada'));

      this.restaurantService.updateOrdersTable();
    }
  }

  selectCheck(index: number) {
    this.restaurantService.orders[index].selected = !this.restaurantService.orders[index].selected;
  }

  selectAll() {

    for (let indexOrder = 0; indexOrder < this.restaurantService.table!.orders.length; indexOrder++) {
      let check: OrderInterface = this.restaurantService.orders[indexOrder];

      if (!check.selected) {
        check.selected = true;
        break;
      }

    }

  }


  viewTranCheck(indexCheck: number) {

    this.restaurantService.indexMoveCheck = indexCheck;

    this.restaurantService.tipoTraslado = 2; // Transaccion

    this.restaurantService.viewChecksMove = false;
    this.restaurantService.viewTranCheckMove = true;
  }

  getGuarniciones(indexTra: number): string {
    let order: OrderInterface = this.restaurantService.orders[this.restaurantService.indexMoveCheck];

    // Verificar si order, transacciones, guarniciones existen
    if (!order || !order.transacciones || !order.transacciones[indexTra] || !order.transacciones[indexTra].guarniciones) {
      return '';
    }

    let guarniciones: GarnishTraInteface[] = order.transacciones[indexTra].guarniciones;

    return guarniciones
      .map((garnish) => {
        const garnishDescriptions = garnish.garnishs
          .map((guarnicion) => guarnicion.descripcion)
          .join(' ');

        // Verificar si garnish.selected existe y tiene descripcion
        const selectedDescription = garnish.selected?.descripcion || '';

        return `${garnishDescriptions} ${selectedDescription}`;
      })
      .join(', ');
  }

  imagen(producto: ProductRestaurantInterface) {

    // producto.objeto_Imagen = "https://aprende.guatemala.com/wp-content/uploads/2016/10/Receta-para-preparar-un-desayuno-chapin.jpg";

    if (producto.objeto_Imagen) {
      this._dialog.open(ImageRestaurantComponent, { data: producto })
      return;
    }

    this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinImagenes'));
  }

  selectTranCheck(indexTra: number) {
    this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones[indexTra].selected = !this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones[indexTra].selected;
  }


}
