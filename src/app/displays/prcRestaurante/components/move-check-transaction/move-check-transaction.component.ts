import { Component } from '@angular/core';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderInterface } from '../../interfaces/order.interface';
import { GarnishTraInteface } from '../../interfaces/garnish.interface';
import { ProductRestaurantInterface } from '../../interfaces/product-restaurant';
import { ImageRestaurantComponent } from '../image-restaurant/image-restaurant.component';

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

      this._notificationService.openSnackbar("Cuenta creada."); //TODO:Translate

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

    //TODO: borrar la imagen
    // producto.objeto_Imagen = "https://aprende.guatemala.com/wp-content/uploads/2016/10/Receta-para-preparar-un-desayuno-chapin.jpg";

    if (producto.objeto_Imagen) {
      this._dialog.open(ImageRestaurantComponent, { data: producto })
      return;
    }

    this._notificationService.openSnackbar("No hay imagen asociada a este producto"); //TODO:Translate

  }

  restar(indexTra: number) {


    if (this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones[indexTra].cantidad == 1) {
      this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones[indexTra].cantidad == 1;
      //TODO: mostrar iconp de basura y dialogo para eliminar transaccion
      return;
    }

    //disminuir cantidad en 1
    this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones[indexTra].cantidad--;

    this.calcTotal();
  }


  sumar(indexTran: number) {
    this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones[indexTran].cantidad++;
    this.calcTotal();
  }

  calcTotal() {

  }
  validarNumeros(event: any) {
    // Obtener el código de la tecla presionadad
    let codigoTecla = event.which ? event.which : event.keyCode;

    // Permitir solo números (códigos de tecla entre 48 y 57 son números en el teclado)
    if (codigoTecla < 48 || codigoTecla > 57) {
      event.preventDefault();
    }
  }

  selectTranCheck(indexTra: number) {
    this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones[indexTra].selected = !this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones[indexTra].selected;
  }


}
