import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DetalleComponent } from '../detalle/detalle.component';
import { ProductoService } from '../../services/producto.service';
import { ProductService } from '../../services/product.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { FactorConversionInterface } from '../../interfaces/factor-conversion.interface';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { UnitarioInterface } from '../../interfaces/unitario.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { FacturaService } from '../../services/factura.service';
import { TraInternaInterface } from '../../interfaces/tra-interna.interface';
import { ProductoInterface } from '../../interfaces/producto.interface';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
  providers: [
    ProductService,
  ]
})
export class ProductoComponent {

  isLoading: boolean = false;

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;



  constructor(
    public dialogRef: MatDialogRef<DetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public producto: ProductoInterface,
    public productoService: ProductoService,
    private _productService: ProductService,
    private _notificationsService: NotificationsService,
    public facturaService: FacturaService,
  ) {

  }


  calculateTotal() {
    if (!this.productoService.precio) {
      this.productoService.total = 0;
      return;
    }

    let cantidad = this.convertirTextoANumero(this.productoService.cantidad);

    this.productoService.total = cantidad! * this.productoService.precio.precioU;

  }

  editPrice() {
    if (this.convertirTextoANumero(this.productoService.precioText) == null) {
      //TODO:translate
      this._notificationsService.openSnackbar("La cantidad debe ser numerica o positiva.");
      return;
    }


    let precio = this.convertirTextoANumero(this.productoService.precioText);

    if (precio! < this.productoService.precioU) {
      //TODO:translate
      this._notificationsService.openSnackbar("El precio no puede ser menor al precio autorizado. Comuniquese con el encargo de inventarios.");
      return;
    }


    this.productoService.precio!.precioU = precio!;

    this.calculateTotal();


  }

  changeCantidad() {
    if (this.convertirTextoANumero(this.productoService.cantidad) == null) {
      //TODO:translate
      this._notificationsService.openSnackbar("La cantidad debe ser numerica o positiva.");
      return;
    }

    this.calculateTotal();

  }


  async changeBodega() {

    //reiniciar valores 
    this.productoService.total = 0;
    this.productoService.precios = [];
    this.productoService.precio = undefined;
    this.productoService.precioU = 0;
    this.productoService.precioText = "0";

    let bodega: number = this.productoService.bodega!.bodega;


    this.isLoading = true;

    //buscar precios
    let resPrecio = await this._productService.getPrecios(
      this.user,
      this.token,
      bodega,
      this.producto.producto,
      this.producto.unidad_Medida,
    );


    if (!resPrecio.status) {
      this.isLoading = false;

      this._notificationsService.showErrorAlert(resPrecio);
      return;
    }

    let precios: PrecioInterface[] = resPrecio.response;

    precios.forEach(element => {
      this.productoService.precios.push(
        {
          id: element.tipo_Precio,
          precioU: element.precio_Unidad,
          descripcion: element.des_Tipo_Precio,
          precio: true,
          moneda: element.moneda,
        }
      );
    });

    //si no hay precios buscar factor conversion
    if (this.productoService.precios.length == 0) {
      let resfactor = await this._productService.getFactorConversion(
        this.user,
        this.token,
        bodega,
        this.producto.producto,
        this.producto.unidad_Medida,
      );

      if (!resfactor.status) {

        this.isLoading = false;

        this._notificationsService.showErrorAlert(resfactor);
        return;
      }


      let factores: FactorConversionInterface[] = resfactor.response;


      factores.forEach(element => {
        this.productoService.precios.push(
          {
            id: element.tipo_Precio,
            precioU: element.precio_Unidad,
            descripcion: element.des_Tipo_Precio,
            precio: false,
            moneda: element.moneda,
          }
        );
      });

    }

    //si no hay precos ni factores

    if (this.productoService.precios.length == 1) {

      let precioU: UnitarioInterface = this.productoService.precios[0];

      this.productoService.precio = precioU;
      this.productoService.total = precioU.precioU;
      this.productoService.precioU = precioU.precioU;
      this.productoService.precioText = precioU.precioU.toString();
    }


    this.isLoading = false;

    this.calculateTotal();


  }


  changePrice() {
    let precioU: UnitarioInterface = this.productoService.precios[0];

    this.productoService.precio = precioU;
    this.productoService.total = precioU.precioU;
    this.productoService.precioU = precioU.precioU;
    this.productoService.precioText = precioU.precioU.toString();

    this.calculateTotal();

  }


  convertirTextoANumero(texto: string): number | null {
    // Verificar si la cadena es un número
    const esNumero = /^\d+(\.\d+)?$/.test(texto);

    if (esNumero) {
      // Realizar la conversión a número
      return parseFloat(texto);
      // Si quieres convertir a un número entero, puedes usar parseInt(texto) en lugar de parseFloat.
    } else {
      // Retornar null si la cadena no es un número
      return null;
    }
  }

  sumar() {

    if (this.convertirTextoANumero(this.productoService.cantidad) == null) {
      //TODO:translate
      this._notificationsService.openSnackbar("La cantidad debe ser numerica o positiva.");
      return;
    }

    let cantidad = this.convertirTextoANumero(this.productoService.cantidad);

    cantidad!++;

    this.productoService.cantidad = cantidad!.toString();

    this.calculateTotal();


  }

  restar() {

    if (this.convertirTextoANumero(this.productoService.cantidad) == null) {
      //TODO:translate
      this._notificationsService.openSnackbar("La cantidad debe ser numerica o positiva.");
      return;
    }

    let cantidad = this.convertirTextoANumero(this.productoService.cantidad);


    cantidad!--;

    if (cantidad! <= 0) {
      cantidad = 0;
    }

    this.productoService.cantidad = cantidad!.toString();

    this.calculateTotal();



  }
  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  enviar() {


    //Validaciones


    if (this.convertirTextoANumero(this.productoService.cantidad) == null) {
      //TODO:Translate
      this._notificationsService.openSnackbar("La cantidad debe ser numerica.");
      return;

    }

    if (this.convertirTextoANumero(this.productoService.cantidad)! <= 0) {
      //TODO:Translate
      this._notificationsService.openSnackbar("La cantidad debe ser mayor a 0.");
      return;
    }

    if (this.facturaService.montos.length > 0) {
      //TODO:Translate
      this._notificationsService.openSnackbar("Elimina primero las formas de pago.");
      return;
    }

    if (!this.productoService.bodega) {
      //TODO:Translate
      this._notificationsService.openSnackbar("Selecciona una bodega.");
      return;
    }

    if (this.productoService.precios.length > 0 && !this.productoService.precio) {
      //TODO:Translate
      this._notificationsService.openSnackbar("Selecciona un tipo de precio.");
      return;
    }

    if (this.productoService.precio!.precioU < this.productoService.precioU) {
      //TODO:Translate
      this._notificationsService.openSnackbar("El precio no puede ser menor al precio autorizado. Comuniquese con el encargo de inventarios.");
      return;
    }


    if (this.productoService.bodega.existencia == 0) {
      //TODO:Translate
      this._notificationsService.openSnackbar("No es posible agregar la transaccion porque la existencia es insuficiente.");
      return;
    }


    if (this.facturaService.traInternas.length > 0) {
      let monedaDoc = 0;
      let monedaTra = 0;

      let firstTra: TraInternaInterface = this.facturaService.traInternas[0];

      monedaDoc = firstTra.precio!.moneda;
      monedaTra = this.productoService.precio!.moneda;


      if (monedaDoc != monedaTra) {
        //TODO:Translate

        this._notificationsService.openSnackbar("No se puede agregar la transacción porque la moneda es distinta a las transacciones existentes.");
        return;
      }

    }


    this.facturaService.addTransaction(
      {
        isChecked: false,
        bodega: this.productoService.bodega,
        producto: this.producto,
        precio: this.productoService.precio!,
        cantidad: this.convertirTextoANumero(this.productoService.cantidad)!,
        total: this.productoService.total,
        cargo: 0,
        descuento: 0,
        operaciones: [],
      }
    );


    //TODO:Translate
    this._notificationsService.openSnackbar("Transaccion agregada.");

    this.dialogRef.close();

  }

}
