import { Component, Inject } from '@angular/core';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-clientes-encontrados',
  templateUrl: './clientes-encontrados.component.html',
  styleUrls: ['./clientes-encontrados.component.scss']
})
export class ClientesEncontradosComponent {

  clientes: ClienteInterface[] = [];
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ClientesEncontradosComponent>,
    @Inject(MAT_DIALOG_DATA) public clientesEncontrados: ClienteInterface[],
  ) {
    this.clientes = clientesEncontrados
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

}
