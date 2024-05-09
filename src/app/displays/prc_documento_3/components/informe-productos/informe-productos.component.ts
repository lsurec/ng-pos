import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ValidateProductInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/validate-product.interface';
import { ProductoInterface } from 'src/app/displays/prc_documento_3/interfaces/producto.interface';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';
import { ProductoService } from 'src/app/displays/prc_documento_3/services/producto.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PrinterService } from 'src/app/services/printer.service';
import * as pdfMake from 'pdfmake/build/pdfmake';


@Component({
  selector: 'app-informe-productos',
  templateUrl: './informe-productos.component.html',
  styleUrls: ['./informe-productos.component.scss'],
  providers:[PrinterService]
})
export class InformeProductosComponent {

  productos: ValidateProductInterface[] = []; //lista de productos encontrados
  isLoading: boolean = false; //pantalla de carga


  constructor(
    //Instancias de los servicios qeu se van  a usar
    public dialogRef: MatDialogRef<InformeProductosComponent>,
    @Inject(MAT_DIALOG_DATA) public productosEncontrados: ValidateProductInterface[],
    private _pirntService:PrinterService,
  ) {
    //porudtcos disponibles
    this.productos = productosEncontrados;    
  }


  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  async downloadPDF(){





    let doc = await this._pirntService.getFormatProductValidate(this.productos);

    
    pdfMake.createPdf(doc).open();


  }

}
