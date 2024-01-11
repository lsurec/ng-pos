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
    private _facturaService:FacturaService,

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
    if(this.filtrosProductos == 1){
      res = await this._productService.getProductId(
        this.token,
        filtro,
      ); 
    }

    //filtro 2 = descripcion
    if(this.filtrosProductos == 2){
      res = await this._productService.getProductDesc(
        this.token,
        filtro,
      );
    }

    this._facturaService.isLoading = false;

    
    if(!res!.status){
      this._notificationsService.showErrorAlert(res!);
      return;
    }


    let productos:ProductoInterface[] = res!.response;


    if(productos.length == 0){
      this._notificationsService.openSnackbar("No hay coincidencias para la busqueda");
      return;
    }

    if(productos.length ==1){
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

        return;
      })
    }
    

      let productosDialog = this._dialog.open(ProductosEncontradosComponent, { data: productos })
      productosDialog.afterClosed().subscribe(result => {
        if (result) {

          let productoSeleccionado: ProductoInterface = result[0];
          console.log(productoSeleccionado);

          if (!productoSeleccionado) {
            console.log("no se selecciono ningun producto");
            return
          } else {
            let productoDialog2 = this._dialog.open(ProductoComponent, { data: productoSeleccionado })
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
          }
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
