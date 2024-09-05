import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FacturaService } from '../../services/factura.service';

@Component({
  selector: 'app-input-termino',
  templateUrl: './input-termino.component.html',
  styleUrls: ['./input-termino.component.scss']
})
export class InputTerminoComponent {

  textModify: String = "";

  constructor(
    public dialogRef: MatDialogRef<InputTerminoComponent>,
    @Inject(MAT_DIALOG_DATA) public index: number,
    public facturaService: FacturaService,
  ) {


    if (index == -1) {

      this.textModify = "";
    } else {
      this.textModify = facturaService.terminosyCondiciones[index];

    }


  }


  modify() {


    if (this.index == -1) {
      this.facturaService.terminosyCondiciones.push(this.textModify);
      
    } else {

      this.facturaService.terminosyCondiciones[this.index] = this.textModify;
    }



    this.dialogRef.close();
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

}
