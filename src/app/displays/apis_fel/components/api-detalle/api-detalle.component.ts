import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CertificadorService } from '../../services/certificador.service';
import { TipoMetodoInterface } from '../../interfaces/tipo_metodo.interface';
import { TipoRespuestaInterface } from '../../interfaces/tipo_respuesta.interface';
import { TipoServicioInterface } from '../../interfaces/tipo_servicio.interface';
import { CatalogoAPIInterface } from '../../interfaces/catalogo_api.interface';
import { Parametro } from '../../interfaces/parametro.interface';

@Component({
  selector: 'app-api-detalle',
  templateUrl: './api-detalle.component.html',
  styleUrls: ['./api-detalle.component.scss']
})
export class ApiDetalleComponent implements OnInit {
  @ViewChildren('plantillaInput') plantillaInputs!: QueryList<ElementRef>;
  @ViewChildren('descripcionInput') descripcionInputs!: QueryList<ElementRef>;
  private nuevoElementoAgregado = false;

  items: Parametro[] = [];

  api?: CatalogoAPIInterface;

  metodo?: TipoMetodoInterface;
  servicio?: TipoServicioInterface;
  respuesta?: TipoRespuestaInterface;
  url?: string;
  nodoFirmaDoc?: string;
  escribir: boolean = false;

  constructor(
    public mantenimiento: CertificadorService,
  ) {

  }

  ngOnInit(): void {
    this.api = this.mantenimiento.api;
    this.url = this.api ? this.api.Url_Api : '';
    this.nodoFirmaDoc = this.api ? this.api.Nodo_FirmaDocumentoResponse : '';
    this.metodo = this.api ? this.mantenimiento.getTipoMetodo(this.api!.Tipo_Metodo)! : undefined;
    this.respuesta = this.api ? this.mantenimiento.getTipoRespuesta(this.api!.Tipo_Respuesta)! : undefined;
    this.servicio = this.api ? this.mantenimiento.getTipoServicio(this.api!.Tipo_Servicio)! : undefined;
  }

  backPage() {
    this.mantenimiento.api = undefined;
    this.mantenimiento.apiDetalle = false;
    this.mantenimiento.certificador = false;
    this.mantenimiento.catalogo = true;
  }

  loadData() {
  }

  aceptar() {

  }

  guardar() {
  }


  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Resetea la altura para calcular la nueva altura
    const newHeight = Math.min(textarea.scrollHeight, 150); // Calcula la nueva altura, con un máximo de 150px (10 rows aprox.)
    textarea.style.height = newHeight + 'px';
  }

  agregarItem(valorFoco: number) {
    //Para saber que input se va a seleccionar
    this.foco = valorFoco;

    // Si la lista está vacía, permite agregar el primer elemento
    if (this.items.length === 0 || this.tieneValores(this.items[this.items.length - 1])) {
      this.items.push({ parametro: null, valorN: '', dato: null, descripcionN: '' });
      this.nuevoElementoAgregado = true; // Marca para enfocar el nuevo elemento   
    }

    this.escribir = true;
  }

  // Función para verificar si un item tiene algún valor
  tieneValores(item: Parametro): boolean {
    return !!item.parametro || !!item.valorN || !!item.dato || !!item.descripcionN;
  }

  ngAfterViewChecked() {
    // Enfoca el último input si se agregó un nuevo elemento
    if (this.nuevoElementoAgregado) {
      this.focusAndSelectText();
      this.nuevoElementoAgregado = false; // Resetea la marca para futuras adiciones
    }
  }

  foco: number = 0;

  focusAndSelectText() {

    //0 es para el parametro
    if (this.foco == 0) {
      const inputElement = this.plantillaInputs.last?.nativeElement; // Obtiene el último input
      if (inputElement) {
        inputElement.focus(); // Enfoca el input
        setTimeout(() => {
          inputElement.setSelectionRange(0, inputElement.value.length); // Selecciona el texto
        }, 0);
      }
      return;
    }

    //1 es para la descripcion
    if (this.foco == 1) {
      const inputElement = this.descripcionInputs.last?.nativeElement; // Obtiene el último input
      if (inputElement) {
        inputElement.focus(); // Enfoca el input
        setTimeout(() => {
          inputElement.setSelectionRange(0, inputElement.value.length); // Selecciona el texto
        }, 0);
      }
      return;
    }
  }
}