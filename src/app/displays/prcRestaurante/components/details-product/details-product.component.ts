import { Component, OnInit } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GarnishInterface, GarnishTraInteface, GarnishTreeInterface } from '../../interfaces/garnish.interface';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';
import { FactorConversionInterface } from 'src/app/displays/prc_documento_3/interfaces/factor-conversion.interface';
import { PrecioInterface } from 'src/app/displays/prc_documento_3/interfaces/precio.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { RestaurantService } from '../../services/restaurant.service';
import { TranslateService } from '@ngx-translate/core';
import { BodegaProductoInterface } from 'src/app/displays/prc_documento_3/interfaces/bodega-produto.interface';
import { UnitarioInterface } from 'src/app/displays/prc_documento_3/interfaces/unitario.interface';
import { TraRestaurantInterface } from '../../interfaces/tra.restaurant.interface';
import { SelectCheckComponent } from '../select-check/select-check.component';

@Component({
  selector: 'app-details-product',
  templateUrl: './details-product.component.html',
  styleUrls: ['./details-product.component.scss'],
  providers: [ProductService, RestaurantService,],
})
export class DetailsProductComponent implements OnInit {

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo

  isLoading: boolean = false;
  cantidad: number = 1;

  total: number = 0;

  bodegas: BodegaProductoInterface[] = [];
  bodega?: BodegaProductoInterface;

  unitarios: UnitarioInterface[] = [];
  unitario?: UnitarioInterface;
  observacion: string = "";


  garnishs: GarnishTreeInterface[] = [];

  constructor(
    private _restaurantService: RestaurantService,
    public restaurantService: GlobalRestaurantService,
    public dialogRef: MatDialogRef<DetailsProductComponent>,
    private _productService: ProductService,
    private _facturaService: FacturaService,
    private _notificationService: NotificationsService,
    private _translate: TranslateService,
    private _dialog: MatDialog,
  ) {



  }
  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    //cuando ya se tenga el producto seleccionado, cargar todo lo necesario y abrir el dualogo
    this.isLoading = true;

    let resGarnish: boolean = await this.loadGarnishs();

    if (!resGarnish) {
      this.isLoading = false;
      return;
    }

    let resBodega: boolean = await this.laodBodegas();

    if (!resBodega) {
      this.isLoading = false;
      return;
    }

    let resPrecios: boolean = await this.loadPrecioUnitario();

    if (!resPrecios) {
      this.isLoading = false;
      return;
    }

    this.isLoading = false;


    //asiganr precio unitario
    this.calcTotal();

  }


  calcTotal() {
    this.total = (this.unitario?.precioU ?? 0) * this.cantidad;
  }

  async changeBodega() {

    this.restaurantService.isLoading = true;

    await this.loadPrecioUnitario();

    this.calcTotal();

    this.restaurantService.isLoading = false;

  }


  enviar() {

    if (!this.cantidad || this.cantidad < 1) {

      this._notificationService.openSnackbar("No hay cantidad"); //TODO:Translate
      return;
    }


    if (!this.bodega) {

      this._notificationService.openSnackbar("No hay bodega seleccionada");  //TODO:Translate
      return;
    }


    if (!this.unitario) {

      this._notificationService.openSnackbar("No hay precio seleccioando"); //TODO:Translate
      return;
    }

    this.garnishs.forEach(node => {
      if (node.children.length > 0) {
        if (!node.selected) {
          this._notificationService.openSnackbar(`Seleccione una opcion (${node.item?.descripcion})`);
          return; //TODO:Translate
        }
      }
    });


    let selectGarnishs: GarnishTraInteface[] = [];


    this.garnishs.forEach(element => {

      let routes: GarnishInterface[] = [];


      element.route.forEach(item => {
        routes.push(item.item!);
      });

      selectGarnishs.push({
        garnishs: routes,
        selected: element.selected!,
      });

    });


    let transaction: TraRestaurantInterface = {
      bodega: this.bodega,
      cantidad: this.cantidad,
      guarniciones: selectGarnishs,
      observacion: this.observacion,
      precio: this.unitario,
      processed: false,
      producto: this.restaurantService.product!,
      selected: false,
    }


    if (this.restaurantService.table!.orders.length == 0) {
      this.restaurantService.addFirst(
        {
          consecutivo: 0,
          consecutivoRef: 0,
          mesa: this.restaurantService.table!,
          mesero: this.restaurantService.waiter!,
          nombre: "Cuenta 1",
          selected: false,
          transacciones: [transaction],
          ubicacion: this.restaurantService.location!,
        }
      );


      this._notificationService.openSnackbar("Producto agregado"); //TODO:Translate

      this.closeDialog();

      return;
    }

    if (this.restaurantService.table!.orders.length == 1) {
      this.restaurantService.addTransactionFirst(
        transaction,
        this.restaurantService.table!.orders[0],
      );

      this._notificationService.openSnackbar("Producto agregado"); //TODO:Translate

      this.closeDialog();

      return;
    }

    //navega a dialogo de cuentas disponibles

    let checkSelected = this._dialog.open(SelectCheckComponent)
    checkSelected.afterClosed().subscribe(result => {
      if (result || result == 0) {
        let index: number = result;

        this.restaurantService.addTransactionToOrder(transaction, index);
        this.closeDialog();
        this._notificationService.openSnackbar("Producto agregado"); //TODO:Translate

        return;
      };

    });


  }

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

    this.calcTotal();
  }


  sumar() {
    this.cantidad++;
    this.calcTotal();
  }


  validarNumeros(event: any) {
    // Obtener el código de la tecla presionada
    let codigoTecla = event.which ? event.which : event.keyCode;

    // Permitir solo números (códigos de tecla entre 48 y 57 son números en el teclado)
    if (codigoTecla < 48 || codigoTecla > 57) {
      event.preventDefault();
    }
  }

  changeRoute(indexTree: number, indexRoute: number): void {
    // Remover las rutas desde indexRoute + 1 hasta el final
    this.garnishs[indexTree].route.splice(
      indexRoute + 1,
      this.garnishs[indexTree].route.length - (indexRoute + 1)
    );

    // Establecer el campo selected como null
    this.garnishs[indexTree].selected = null;

  }


  changeGarnishActive(index: number, node: GarnishTreeInterface): void {
    // Si el nodo tiene hijos, agregar el nodo a la ruta
    if (node.children && node.children.length > 0) {
      this.garnishs[index].route.push(node);

      // Notificar cambios
      return;
    }

    // Si no tiene hijos, seleccionar el item del nodo
    this.garnishs[index].selected = node.item;

  }




  async loadPrecioUnitario(): Promise<boolean> {
    this.unitario = undefined;
    this.unitarios = [];


    const apiPrecio = () => this._productService.getPrecios(
      this.user,
      this.token,
      this.bodega!.bodega,
      this.restaurantService.product!.producto,
      this.restaurantService.product!.unidad_Medida,
      1,
      "1",
    );

    let resPrecio: ResApiInterface = await ApiService.apiUse(apiPrecio);

    //si algo salio mal
    if (!resPrecio.status) {
      this.dialogRef.close();
      this.showError(resPrecio);

      return false;
    }

    let precios: PrecioInterface[] = resPrecio.response;


    precios.forEach(precio => {
      this.unitarios.push(
        {
          descripcion: precio.des_Tipo_Precio,
          id: precio.tipo_Precio,
          moneda: precio.moneda,
          orden: precio.precio_Orden,
          precio: true,
          precioU: precio.precio_Unidad,
        }
      )
    });


    if (this.unitarios.length > 0) {
      this.unitario = this.unitarios.reduce((prev, curr) => {
        // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
        const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
        const currOrden = curr.orden ?? Infinity;
        return (currOrden < prevOrden) ? curr : prev;
      });

      return true;
    }


    const apiFactor = () => this._productService.getFactorConversion(
      this.user,
      this.token,
      this.bodega!.bodega,
      this.restaurantService.product!.producto,
      this.restaurantService.product!.unidad_Medida,
    )

    let resFactor: ResApiInterface = await ApiService.apiUse(apiFactor);

    //si algo salio mal
    if (!resFactor.status) {
      this.dialogRef.close();
      this.showError(resFactor);

      return false;
    }

    let factores: FactorConversionInterface[] = resFactor.response;

    factores.forEach(factor => {
      this.unitarios.push(
        {
          descripcion: factor.des_Tipo_Precio,
          id: factor.tipo_Precio,
          moneda: factor.moneda,
          orden: factor.tipo_Precio_Orden,
          precio: true,
          precioU: factor.precio_Unidad,
        }
      )
    });


    if (this.unitarios.length > 0) {
      this.unitario = this.unitarios.reduce((prev, curr) => {
        // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
        const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
        const currOrden = curr.orden ?? Infinity;
        return (currOrden < prevOrden) ? curr : prev;
      });

    }

    return true;


  }

  async laodBodegas(): Promise<boolean> {

    this.bodegas = [];
    const api = () => this._productService.getBodegaProducto(
      this.user,
      this.token,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
      this.restaurantService.product!.producto,
      this.restaurantService.product!.unidad_Medida,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.dialogRef.close();
      this.showError(res);

      return false;
    }

    this.bodegas = res.response;

    if (this.bodegas.length > 0) {

      //TODO:Implementar en POS
      this.bodega = this.bodegas.reduce((prev, curr) => {
        // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
        const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
        const currOrden = curr.orden ?? Infinity;
        return (currOrden < prevOrden) ? curr : prev;
      });
    }


    return true;
  }

  async loadGarnishs(): Promise<boolean> {
    this.garnishs = [];
    const api = () => this._restaurantService.getGarnish(
      this.restaurantService.product!.producto,
      this.restaurantService.product!.unidad_Medida,
      this.user,
      this.token,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.dialogRef.close();
      this.showError(res);

      return false;
    }

    let garnishs: GarnishInterface[] = res.response;

    //load tree Garnish
    this.orderGarnish(garnishs);

    return true;



  }

  orderGarnish(garnishs: GarnishInterface[]) {

    let padres: GarnishTreeInterface[] = [];
    let hijos: GarnishTreeInterface[] = [];


    garnishs.forEach(garnish => {

      let item: GarnishTreeInterface = {
        children: [],
        route: [],
        idChild: garnish.producto_Caracteristica,
        idFather: garnish.producto_Caracteristica_Padre,
        item: garnish,
        selected: null,
      }

      if (garnish.producto_Caracteristica_Padre == null) {
        padres.push(item);
      } else {
        hijos.push(item);
      }


    });


    this.garnishs = this.ordenarNodos(padres, hijos);

    this.loadFirstharnish();

  }


  loadFirstharnish() {
    this.garnishs.forEach(element => {
      element.route.push(element);
    });
  }

  // Función recursiva para ordenar nodos infinitos, recibe nodos principales y nodos a ordenar
  ordenarNodos(
    padres: GarnishTreeInterface[], hijos: GarnishTreeInterface[]): GarnishTreeInterface[] {
    // Recorrer los nodos principales
    for (var i = 0; i < padres.length; i++) {
      // Item padre de la iteración
      let padre: GarnishTreeInterface = padres[i];

      // Recorrer todos los hijos en orden inverso para evitar problemas al eliminar
      for (var j = hijos.length - 1; j >= 0; j--) {
        // Item hijo de la iteración
        let hijo: GarnishTreeInterface = hijos[j];

        // Si coinciden (padre > hijo), agregar ese hijo al padre
        if (padre.idChild == hijo.idFather) {
          padre.children.push(hijo); // Agregar hijo al padre
          // Eliminar al hijo que ya se usó para evitar repetirlo
          hijos.splice(j, 1);

          // Llamar a la misma función (recursividad) se detiene cuando ya no hay hijos
          this.ordenarNodos(padre.children, hijos);
        }
      }
    }

    // Retornar nodos ordenados
    return padres;
  }

  async showError(res: ResApiInterface) {

    //Diaogo de confirmacion
    let verificador = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    //Cancelar
    if (!verificador) return;

    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    //Guardar error
    PreferencesService.error = error;

    //TODO:mostrar pantalla de error

    this.restaurantService.verError = true;

    return;
  }

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

      this._notificationService.openSnackbar("Cuenta creada"); //TODO:Translate

      this.restaurantService.updateOrdersTable();
    }
  }

  selectCheck(): Promise<any> {
    return new Promise((resolve, reject) => {

      let dialogRef = this._dialog.open(SelectCheckComponent)

      dialogRef.afterClosed().subscribe(result => {
        resolve(result);
      });
    });
  }
}
