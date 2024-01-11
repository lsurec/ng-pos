import { Component } from '@angular/core';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
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

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss'],
  providers: [
    ProductService
  ]
})
export class DetalleComponent {


  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this._facturaService.tipoDocumento!;

  searchText!: string;
  filtrosProductos: number = 1;
  eliminarPagos: boolean = false;

  tipoDesCar: number = 1;
  filtrosBusqueda: FiltroInterface[] = [
    {
      id: 1,
      nombre: "SKU",
    },
    {
      id: 2,
      nombre: "Descripción",
    },
  ];

  tipos: FiltroInterface[] = [
    {
      id: 1,
      nombre: "Porcentaje",
    },
    {
      id: 2,
      nombre: "Monto",
    },
  ];


  producto!: ProductoInterface;
  // precio!: number;
  // cantidad!: number;
  // total!: number;

  compras: CompraInterface[] = [];

  constructor(
    private _dialog: MatDialog,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
    private _productService: ProductService,
    private _facturaService: FacturaService,
    private _productoService: ProductoService,

  ) { }


  async buscarProducto(filtro: string) {

    //TODO:Translate
    //validar que siempre hay nun texto para buscar
    if (!filtro) {
      this._notificationsService.openSnackbar("Ingresa un texto para la busqueda.")
      return;
    }

    //eliminar espacios al final de la cadena
    filtro = filtro.trim()


    let res: ResApiInterface;


    this._facturaService.isLoading = true;
    //filtro 1 = sku
    if (this.filtrosProductos == 1) {
      res = await this._productService.getProductId(
        this.token,
        filtro,
      );
    }

    //filtro 2 = descripcion
    if (this.filtrosProductos == 2) {
      res = await this._productService.getProductDesc(
        this.token,
        filtro,
      );
    }



    if (!res!.status) {
      this._facturaService.isLoading = false;

      this._notificationsService.showErrorAlert(res!);
      return;
    }


    let productos: ProductoInterface[] = res!.response;


    if (productos.length == 0) {
      this._notificationsService.openSnackbar("No hay coincidencias para la busqueda");
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
        this._facturaService.isLoading = false;
        this._notificationsService.showErrorAlert(resBodega);
        return;
      }

      this._productoService.bodegas = resBodega.response;


      //validar que existan bodegas
      if (this._productoService.bodegas.length == 0) {
        this._facturaService.isLoading = false;
        this._notificationsService.openSnackbar("No hay bodegas asignadas a este producto.");
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
          this._facturaService.isLoading = false;

          this._notificationsService.showErrorAlert(resPrecio);
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

            this._facturaService.isLoading = false;

            this._notificationsService.showErrorAlert(resfactor);
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
        }

      }

      this._facturaService.isLoading = false;


      let productoDialog = this._dialog.open(ProductoComponent, { data: productos[0] })
      productoDialog.afterClosed().subscribe(result => {
        if (result) {
          console.log(result);

          let producto: CompraInterface = result;

          let compra: CompraInterface = {
            producto: producto.producto,
            cantidad: producto.cantidad,
            precioUnitario: producto.precioUnitario,
            total: producto.total,
          }

          this.compras.push(compra);

        }

      })

      return;

    }

    this._facturaService.isLoading = false;


    let productosDialog = this._dialog.open(ProductosEncontradosComponent, { data: productos })
    productosDialog.afterClosed().subscribe(result => {
      if (result) {

        let productoDialog2 = this._dialog.open(ProductoComponent, { data: result })
        productoDialog2.afterClosed().subscribe(result => {
          if (result) {
            console.log(result);

            let producto: CompraInterface = result;

            let compra: CompraInterface = {
              producto: producto.producto,
              cantidad: producto.cantidad,
              precioUnitario: producto.precioUnitario,
              total: producto.total,
            }

            this.compras.push(compra);

          }
        })
        // let producto: ProductoInterface = result[0];
        // this.producto = producto;
      }
    })


  }

  onOptionChange(optionId: number) {
    this.filtrosProductos = optionId;
  }

  onOptionCarDes(optionId: number) {
    this.tipoDesCar = optionId;
  }

  seleccionar() {
    for (let index = 0; index < this.compras.length; index++) {
      const element = this.compras[index];
      element.checked = this.eliminarPagos;
    }
  }

  // Función para manejar la eliminación de pagos seleccionados
  async eliminarProducto() {

    let comprasSeleccionadas: CompraInterface[] = this.compras.filter((compra) => compra.checked);

    if (comprasSeleccionadas.length == 0) {
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
    this.compras = this.compras.filter((compra) => !compra.checked);
    // También puedes realizar otras acciones necesarias aquí
  }

}
