import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DocHistoricoInterface } from 'src/app/displays/prc_documento_3/interfaces/doc-historico.interface';
import { DocumentService } from 'src/app/displays/prc_documento_3/services/document.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-search-doc',
  templateUrl: './search-doc.component.html',
  styleUrls: ['./search-doc.component.scss'],
  providers: [
    DocumentService,
  ]
})
export class SearchDocComponent implements OnInit, AfterViewInit {

  // Referencia al elemento con la clase container_main
  @ViewChild('contentContainer') contentContainer!: ElementRef;
  //para seleciconar el valor del texto del input
  @ViewChild('inputFilterDoc') inputFilterDoc?: ElementRef;

  constructor(
    private _documentService: DocumentService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService

  ) {

    window.addEventListener('scroll', this.scrollEvent, true);

  }

  verBusqueda: boolean = true;
  verDetalle: boolean = false;

  ascendente: boolean = true; //orden de la lista
  documentos: DocHistoricoInterface[] = [];

  verError: boolean = false;
  regresar: number = 0;
  busqueda: string = "";
  botonIrArriba: boolean = false;
  isLoading: boolean = false;
  botonIrAbajo: boolean = true;
  fechaInicial?: NgbDateStruct; //fecha inicial 
  fechaFinal?: NgbDateStruct; //fecha final
  showScrollHeight: number = 400; //En cuantos pixeles se va a mostrar el boton
  hideScrollHeight: number = 200; //en cuantos se va a ocultar
  isScrolling: boolean = false;



  // user: string = PreferencesService.user; //usuario de la sesion
  // token: string = PreferencesService.token; //token del usuario de la sesion
  // empresa: number = PreferencesService.empresa.empresa; // emporesa de la sesuin
  // estacion: number = PreferencesService.estacion.estacion_Trabajo;//etsacion e la sesion


  ngOnInit(): void {
    this.setDate();
    this.loadDocs();
  }

  setDate() {

    let dateNow: Date = new Date();

    this.fechaInicial = { year: dateNow.getFullYear(), month: dateNow.getMonth() + 1, day: dateNow.getDate() };
    this.fechaFinal = { year: dateNow.getFullYear(), month: dateNow.getMonth() + 1, day: dateNow.getDate() };

  }

  async loadDocs() {


    let startDate: Date = new Date();

    startDate.setDate(this.fechaInicial!.day);
    startDate.setMonth(this.fechaInicial!.month - 1);
    startDate.setFullYear(this.fechaInicial!.year);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);

    let endDate: Date = new Date();

    endDate.setDate(this.fechaFinal!.day);
    endDate.setMonth(this.fechaFinal!.month - 1);
    endDate.setFullYear(this.fechaFinal!.year);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);


    this.documentos = [];

    const api = () => this._documentService.getSearchDoc(
      // this.token,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJhZG1pbiIsIm5iZiI6MTczMzg1MDc0MCwiZXhwIjoxNzY0OTU0NzQwLCJpYXQiOjE3MzM4NTA3NDB9.Sv1ZWvpuz7vWswV5Ju_TsSiJtRxCihvCFvajgFEk3j0",
      'ds',
      20,
      "1",
      1,
      1,
      startDate,
      endDate,
      "",
      false,
    );

    this.isLoading = true;

    let res: ResApiInterface = await ApiService.apiUse(api);

    this.isLoading = false;

    //verificar error 
    if(!res.status){
      //TODO:Mostarr infrome de error 
      return;
    }

    this.documentos = res.response;


  }

  filtrar() { }

  //ver detalles
  detalleDoc() {
    this.viewDetails()
  }

  loadData() {
    this.isLoading = true;
  }

  backPage() { }


  backSearch() {
    this.verBusqueda = true;
    this.verDetalle = false;
  }


  viewDetails() {
    this.verBusqueda = false;
    this.verDetalle = true;

  }

  //Escuchando scroll en todos los elementos
  scrollEvent = (event: any): void => {
    const number = event.srcElement.scrollTop; //Donde inicia el scroll
    //verificar que el scrool se ejecute dentro de la calse container_main
    if (event.srcElement.className == "container_main") {
      //evakuar si el scroll esta en la cantidad de pixeles para mostrar el boton
      if (number > this.showScrollHeight) {
        this.botonIrArriba = true; //MMostatr boton
      } else if (number < this.hideScrollHeight) {
        this.botonIrArriba = false; //ocultar boton
      }
    }
  }

  //Evento del scroll
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollEvent, true);
  }


  //IR HACIA ABAJO
  scrollDown() {
    if (this.isScrolling) return; // Si ya está desplazándose, no hacer nada
    this.isScrolling = true; // Marca que el desplazamiento ha comenzado
    const container = this.contentContainer.nativeElement;
    this.smoothScroll(container, container.scrollHeight, 2000, () => {
      this.isScrolling = false; // Desbloquea el desplazamiento al finalizar
    });
  }

  //IR HACIA ARRIBA
  scrollUp() {
    if (this.isScrolling) return; // Si ya está desplazándose, no hacer nada
    this.isScrolling = true; // Marca que el desplazamiento ha comenzado
    const container = this.contentContainer.nativeElement;
    this.smoothScroll(container, 0, 2000, () => {
      this.isScrolling = false; // Desbloquea el desplazamiento al finalizar
    });
  }

  //REALIZAR EL SCROLL
  smoothScroll(element: HTMLElement, target: number, duration: number, callback: () => void) {
    const start = element.scrollTop;
    const change = target - start;
    const increment = 20;
    let currentTime = 0;

    const animateScroll = () => {
      currentTime += increment;
      const val = this.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      } else {
        callback(); // Llama al callback al finalizar el desplazamiento
      }
    };

    animateScroll();
  }

  //CREAR ANIMACION
  easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2; // Normaliza el tiempo en la mitad de la duración
    if (t < 1) return c / 2 * t * t + b; // Aceleración cuadrática
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b; // Desaceleración cuadrática
  }

  ngAfterViewInit() {
    this.focusAndSelectText();
  }

  focusAndSelectText() {
    const inputElement = this.inputFilterDoc!.nativeElement;
    inputElement.focus();
  }

}
