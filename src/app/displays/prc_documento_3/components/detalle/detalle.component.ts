import { Component } from '@angular/core';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { ProductoInterface } from '../../interfaces/producto.interface';
import { MatDialog } from '@angular/material/dialog';
import { ProductosEncontradosComponent } from '../productos-encontrados/productos-encontrados.component';
import { ProductoComponent } from '../producto/producto.component';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../services/product.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { FacturaService } from '../../services/factura.service';
import { ProductoService } from '../../services/producto.service';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { FactorConversionInterface } from '../../interfaces/factor-conversion.interface';
import { UnitarioInterface } from '../../interfaces/unitario.interface';
import { TraInternaInterface } from '../../interfaces/tra-interna.interface';
import { CargoDescuentoComponent } from '../cargo-descuento/cargo-descuento.component';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss'],
  providers: [
    ProductService
  ]
})
export class DetalleComponent {

  //abirir y cerrar el mat expander
  desplegarCarDes: boolean = false;
  valueCargoDescuento: string = "";

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this.facturaService.tipoDocumento!;

  searchText: string = "";
  filtrosProductos: number = 1;

  tipoDesCar: number = 1;
  filtrosBusqueda: FiltroInterface[] = [
    {
      id: 1,
      nombre: "SKU",
    },
    {
      id: 2,
      nombre: this._translate.instant('pos.factura.descripcion'),
    },
  ];

  tipos: FiltroInterface[] = [
    {
      id: 1,
      nombre: this._translate.instant('pos.factura.porcentaje'),
    },
    {
      id: 2,
      nombre: this._translate.instant('pos.factura.monto'),
    },
  ];


  constructor(
    private _dialog: MatDialog,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
    private _productService: ProductService,
    public facturaService: FacturaService,
    private _productoService: ProductoService,
    private _eventService: EventService,
  ) { }


  async buscarProducto() {

    //validar que siempre hay nun texto para buscar
    if (!this.searchText) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.ingreseCaracter'));
      return;
    }

    //eliminar espacios al final de la cadena
    this.searchText = this.searchText.trim()


    let res: ResApiInterface;


    this.facturaService.isLoading = true;
    //filtro 1 = sku
    if (this.filtrosProductos == 1) {
      res = await this._productService.getProductId(
        this.token,
        this.searchText,
      );
    }

    //filtro 2 = descripcion
    if (this.filtrosProductos == 2) {
      res = await this._productService.getProductDesc(
        this.token,
        this.searchText,
      );
    }



    if (!res!.status) {

      this.facturaService.isLoading = false;




      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(res!);

      return;

    }

    let productos: ProductoInterface[] = res!.response;


    if (productos.length == 0) {
      this.facturaService.isLoading = false;

      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinCoincidencias'));
      return;
    }


    //reiniciar valores 
    this._productoService.total = 0;
    this._productoService.precios = [];
    this._productoService.precio = undefined;
    this._productoService.bodegas = [];
    this._productoService.bodega = undefined;
    this._productoService.cantidad = "1";
    this._productoService.precioU = 0;
    this._productoService.precioText = "0";


    if (productos.length == 1) {

      let product = productos[0];

      //buscar bodegas del produxto
      let resBodega = await this._productService.getBodegaProducto(
        this.user,
        this.token,
        this.empresa,
        this.estacion,
        product.producto,
        product.unidad_Medida,
      );


      if (!resBodega.status) {

        this.facturaService.isLoading = false;


        let verificador = await this._notificationsService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.verError(resBodega);

        return;

      }

      this._productoService.bodegas = resBodega.response;


      //validar que existan bodegas
      if (this._productoService.bodegas.length == 0) {
        this.facturaService.isLoading = false;
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinBodegas'));
        return;
      }


      //Si solo hay una bodega
      if (this._productoService.bodegas.length == 1) {
        this._productoService.bodega = this._productoService.bodegas[0];
        let bodega: number = this._productoService.bodega.bodega;

        //buscar precios
        let resPrecio = await this._productService.getPrecios(
          this.user,
          this.token,
          bodega,
          product.producto,
          product.unidad_Medida,
        );


        if (!resPrecio.status) {

          this.facturaService.isLoading = false;


          let verificador = await this._notificationsService.openDialogActions(
            {
              title: this._translate.instant('pos.alertas.salioMal'),
              description: this._translate.instant('pos.alertas.error'),
              verdadero: this._translate.instant('pos.botones.informe'),
              falso: this._translate.instant('pos.botones.aceptar'),
            }
          );

          if (!verificador) return;

          this.verError(resPrecio);

          return;

        }

        let precios: PrecioInterface[] = resPrecio.response;

        precios.forEach(element => {
          this._productoService.precios.push(
            {
              id: element.tipo_Precio,
              precioU: element.precio_Unidad,
              descripcion: element.des_Tipo_Precio,
              precio: true,
              moneda: element.moneda,
              orden:element.precio_Orden,
            }
          );
        });

        //si no hay precios buscar factor conversion
        if (this._productoService.precios.length == 0) {
          let resfactor = await this._productService.getFactorConversion(
            this.user,
            this.token,
            bodega,
            product.producto,
            product.unidad_Medida,
          );

          if (!resfactor.status) {

            this.facturaService.isLoading = false;

            let verificador = await this._notificationsService.openDialogActions(
              {
                title: this._translate.instant('pos.alertas.salioMal'),
                description: this._translate.instant('pos.alertas.error'),
                verdadero: this._translate.instant('pos.botones.informe'),
                falso: this._translate.instant('pos.botones.aceptar'),
              }
            );

            if (!verificador) return;

            this.verError(resfactor);

            return;

          }


          let factores: FactorConversionInterface[] = resfactor.response;


          factores.forEach(element => {
            this._productoService.precios.push(
              {
                id: element.tipo_Precio,
                precioU: element.precio_Unidad,
                descripcion: element.des_Tipo_Precio,
                precio: false,
                moneda: element.moneda,
                orden:element.tipo_Precio_Orden,
              }
            );
          });

        }

        //si no hay precos ni factores

        if (this._productoService.precios.length == 1) {

          let precioU: UnitarioInterface = this._productoService.precios[0];

          this._productoService.precio = precioU;
          this._productoService.total = precioU.precioU;
          this._productoService.precioU = precioU.precioU;
          this._productoService.precioText = precioU.precioU.toString();

        } else if (this._productoService.precios.length > 1) {
          for (let i = 0; i < this._productoService.precios.length; i++) {
            const element = this._productoService.precios[i];
            if (element.orden) {
              this._productoService.precio = element;
              this._productoService.total = element.precioU;
              this._productoService.precioU = element.precioU;
              this._productoService.precioText = element.precioU.toString();

            }
            break;

          }
        }

      }

      this.facturaService.isLoading = false;


      this._dialog.open(ProductoComponent, { data: productos[0] })


      return;

    }

    this.facturaService.isLoading = false;


    let productosDialog = this._dialog.open(ProductosEncontradosComponent, { data: productos })
    productosDialog.afterClosed().subscribe(result => {
      if (result) {

        this._dialog.open(ProductoComponent, { data: result })
        // let producto: ProductoInterface = result[0];
        // this.producto = producto;
      }
    })


  }

  verTansacciones(index: number) {

    if (this.facturaService.traInternas[index].operaciones.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinCarDes'));
      return;
    }
    this._dialog.open(CargoDescuentoComponent, { data: index })
  }

  onOptionChange(optionId: number) {
    this.filtrosProductos = optionId;
  }

  onOptionCarDes(optionId: number) {
    this.tipoDesCar = optionId;
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


  cargoDescuento(operacion: number) {

    // operacion 1: cargo; 2: descuento

    //1:porcentaje
    //2:monto fijo


    if (this.convertirTextoANumero(this.valueCargoDescuento) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.valorNumerico'));
      return;
    }

    let monto = this.convertirTextoANumero(this.valueCargoDescuento);

    if (monto! <= 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.mayorCero'));
      return;
    }

    if (this.facturaService.montos.length > 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.eliminarPagos'));
      return;
    }

    let prorrateo: number = 0;
    let totalTransactions: number = 0;


    let traCheks: TraInternaInterface[] = this.facturaService.traInternas.filter((transaction) => transaction.isChecked);

    if (traCheks.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    //total de las transacciones seleccionadas
    traCheks.forEach(element => {
      totalTransactions += element.total;
    });

    //si es por monto 
    if (this.tipoDesCar == 2) prorrateo = monto! / totalTransactions;

    //si es por porcentaje
    if (this.tipoDesCar == 1) {

      let porcentaje = 0;
      porcentaje = totalTransactions * monto!;
      porcentaje = porcentaje / 100;
      prorrateo = porcentaje / totalTransactions;
    }

    //multiplicar valores
    this.facturaService.traInternas.forEach(element => {


      let cargoDescuento = prorrateo * element.total;


      //elemento que se va a agregar
      if (element.isChecked) {
        element.operaciones.push(
          {
            precipDia:null, //TODO:Usar precio dia
            isChecked: false,
            producto: element.producto,
            cantidad: 0,
            total: 0,
            cargo: operacion == 1 ? cargoDescuento : 0,
            descuento: operacion == 2 ? cargoDescuento * -1 : 0,
            operaciones: []
          }
        );
      }

    });

    this.facturaService.calculateTotales();
    this._notificationsService.openSnackbar(operacion == 1 ? this._translate.instant('pos.alertas.cargo') : this._translate.instant('pos.alertas.descuento'));
  }



  seleccionar() {
    this.facturaService.traInternas.forEach(element => {
      element.isChecked = this.facturaService.selectAllTra;
    });

  }

  // Función para manejar la eliminación de pagos seleccionados
  async eliminarProducto() {

    let traCheks: TraInternaInterface[] = this.facturaService.traInternas.filter((transaction) => transaction.isChecked);

    if (traCheks.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.perderDatos'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;
    // Realiza la lógica para eliminar los pagos seleccionados, por ejemplo:
    this.facturaService.traInternas = this.facturaService.traInternas.filter((transactions) => !transactions.isChecked);

    this.facturaService.calculateTotales();

    this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.transaccionesEliminadas'));

  }

  verError(res: ResApiInterface) {

    let dateNow: Date = new Date();

    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }


    PreferencesService.error = error;
    this._eventService.verInformeErrorEvent(true);
  }

}
