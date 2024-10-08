import { Component, OnInit } from '@angular/core';
import { elementos } from '../../interfaces/send-order.interface';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { ProductRestaurantInterface } from '../../interfaces/product-restaurant';
import { RestaurantService } from '../../services/restaurant.service';
import { FactorConversionInterface } from 'src/app/displays/prc_documento_3/interfaces/factor-conversion.interface';
import { PrecioInterface } from 'src/app/displays/prc_documento_3/interfaces/precio.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { GarnishInterface, GarnishTreeInterface } from '../../interfaces/garnish.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { BodegaProductoInterface } from 'src/app/displays/prc_documento_3/interfaces/bodega-produto.interface';
import { UnitarioInterface } from 'src/app/displays/prc_documento_3/interfaces/unitario.interface';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadRestaurantService } from '../../services/load.restaurant.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  providers: [RestaurantService]
})
export class ProductsComponent implements OnInit {


  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo



  products: ProductRestaurantInterface[] = [];

  garnishs: GarnishTreeInterface[] = [];

  constructor(
    public restaurantService: GlobalRestaurantService,
    private _restaurantService: RestaurantService,
    private _facturaService: FacturaService,
    private _notificationService: NotificationsService,
    private _productService: ProductService,
    private _translate: TranslateService,
    private _loadRestaurantService: LoadRestaurantService,

  ) {
  }
  ngOnInit(): void {
    this.loadData();

    this._loadRestaurantService.products$.subscribe(() => {
      this.loadData();
    });
  }


  async loadData() {
    this.restaurantService.isLoading = true;
    await this.loadProducts();
    this.restaurantService.isLoading = false;
  }

  async loadProducts(): Promise<boolean> {

    this.products = [];
    this.restaurantService.product = undefined;

    const api = () => this._restaurantService.getProducts(
      this.restaurantService.classification!.clasificacion,
      this.estacion.estacion_Trabajo,
      this.user,
      this.token,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }

    this.products = res.response;

    if (this.products.length == 0) {
      this._notificationService.openSnackbar("No hay productos paar esta clasificacion"); //TODO:Translate

      this.restaurantService.idPantalla = 1; //Clasificaciones
      return false;
    }

    if (this.products.length == 1)
      this.restaurantService.product = this.products[0];

    return true;

  }


  async loadPrecioUnitario(): Promise<boolean> {
    this.restaurantService.unitario = undefined;
    this.restaurantService.unitarios = [];


    const apiPrecio = () => this._productService.getPrecios(
      this.user,
      this.token,
      this.restaurantService.bodega!.bodega,
      this.restaurantService.product!.producto,
      this.restaurantService.product!.unidad_Medida,
      1,
      "1",
    );

    let resPrecio: ResApiInterface = await ApiService.apiUse(apiPrecio);

    //si algo salio mal
    if (!resPrecio.status) {
      this.showError(resPrecio);

      return false;
    }

    let precios: PrecioInterface[] = resPrecio.response;


    precios.forEach(precio => {
      this.restaurantService.unitarios.push(
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


    if (this.restaurantService.unitarios.length > 0) {
      this.restaurantService.unitario = this.restaurantService.unitarios.reduce((prev, curr) => {
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
      this.restaurantService.bodega!.bodega,
      this.restaurantService.product!.producto,
      this.restaurantService.product!.unidad_Medida,
    )

    let resFactor: ResApiInterface = await ApiService.apiUse(apiFactor);

    //si algo salio mal
    if (!resFactor.status) {
      this.showError(resFactor);

      return false;
    }

    let factores: FactorConversionInterface[] = resFactor.response;

    factores.forEach(factor => {
      this.restaurantService.unitarios.push(
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


    if (this.restaurantService.unitarios.length > 0) {
      this.restaurantService.unitario = this.restaurantService.unitarios.reduce((prev, curr) => {
        // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
        const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
        const currOrden = curr.orden ?? Infinity;
        return (currOrden < prevOrden) ? curr : prev;
      });

    }

    return true;


  }

  async laodBodegas(): Promise<boolean> {

    this.restaurantService.bodegas = [];
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
      this.showError(res);

      return false;
    }

    this.restaurantService.bodegas = res.response;

    if (this.restaurantService.bodegas.length > 0) {

      //TODO:Implementar en POS
      this.restaurantService.bodega = this.restaurantService.bodegas.reduce((prev, curr) => {
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

  async selectProduct(product: ProductRestaurantInterface) {
    this.restaurantService.product = product;

    let resGarnish: boolean = await this.loadGarnishs();

    if (!resGarnish) {
      this.restaurantService.isLoading = false;
      return;
    }

    let resBodega: boolean = await this.laodBodegas();

    if (!resBodega) {
      this.restaurantService.isLoading = false;
      return;
    }

    let resPrecios: boolean = await this.loadPrecioUnitario();

    if (!resPrecios) {
      this.restaurantService.isLoading = false;
      return;
    }

    this.restaurantService.isLoading = false;
    this.restaurantService.showDetalle();

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


}
