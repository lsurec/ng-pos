import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ProductoInterface } from 'src/app/displays/prc_documento_3/interfaces/producto.interface';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';
import { ProductoService } from 'src/app/displays/prc_documento_3/services/producto.service';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-informe-productos',
  templateUrl: './informe-productos.component.html',
  styleUrls: ['./informe-productos.component.scss']
})
export class InformeProductosComponent {

  productos: ProductoInterface[] = []; //lista de productos encontrados
  isLoading: boolean = false; //pantalla de carga


  constructor(
    //Instancias de los servicios qeu se van  a usar
    public dialogRef: MatDialogRef<InformeProductosComponent>,
    @Inject(MAT_DIALOG_DATA) public productosEncontrados: ProductoInterface[],
    private _productService: ProductService,
    private _notificationsService: NotificationsService,
    private _productoService: ProductoService,
    private _translate: TranslateService,
  ) {
    //porudtcos disponibles
    this.productos = productosEncontrados;
  }


  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  //seleccionar producto
  async setProduct(product: ProductoInterface) { }

}
