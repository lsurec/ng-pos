// theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    //tema configurado: falso = claro; true = oscuro
    isDarkTheme: boolean = false;
    // Tamaño de fuente global
    fontSize: string = "20px";


    //cambiar tema
    toggleTheme(): void {
        this.isDarkTheme = !this.isDarkTheme;
        this.updateTheme();
    }

    //actualizar tema
    updateTheme(): void {
        const body = document.body; //tiene toda la aplicacion 
        if (this.isDarkTheme) {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
        // Aplicar el tamaño de fuente global
        body.style.fontSize = this.fontSize;
    }

    size() {
        const body = document.body; //tiene toda la aplicacion 
        body.style.fontSize = this.fontSize;

    }
}
