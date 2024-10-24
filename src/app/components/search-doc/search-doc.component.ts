import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-search-doc',
  templateUrl: './search-doc.component.html',
  styleUrls: ['./search-doc.component.scss']
})
export class SearchDocComponent implements OnInit, AfterViewInit {

  // Referencia al elemento con la clase container_main
  @ViewChild('contentContainer') contentContainer!: ElementRef;
  //para seleciconar el valor del texto del input
  @ViewChild('inputFilterDoc') inputFilterDoc?: ElementRef;

  constructor(
    private _notificationsService: NotificationsService,
    private _translate: TranslateService

  ) {

    window.addEventListener('scroll', this.scrollEvent, true);

  }

  verBusqueda: boolean = true;
  verDetalle: boolean = false;

  ascendente: boolean = true; //orden de la lista
  documentos: any[] = [
    "nombre",
    "juana",
    "limon",
    "pedro",
    "sandia",
    "juana",
    "limon",
    "pedro",
    "sandia",
    "juana",
    "limon",
    "pedro",
    "sandia"
  ];
  busqueda: string = "";
  botonIrArriba: boolean = false;
  botonIrAbajo: boolean = true;
  fechaInicial?: NgbDateStruct; //fecha inicial 
  fechaFinal?: NgbDateStruct; //fecha final
  showScrollHeight: number = 400; //En cuantos pixeles se va a mostrar el boton
  hideScrollHeight: number = 200; //en cuantos se va a ocultar
  isScrolling: boolean = false;

  ngOnInit(): void {

  }

  filtrar() { }

  //ver detalles
  detalleDoc() {
    this.viewDetails()
  }


  loadData() { }

  sincronizarFechas() { }

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
