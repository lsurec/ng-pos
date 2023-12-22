// theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    isDarkTheme: boolean = false;

    toggleTheme(): void {
        this.isDarkTheme = !this.isDarkTheme;
        this.updateTheme();
    }

    updateTheme(): void {
        const body = document.body; //tiene toda la aplicacion 
        if (this.isDarkTheme) {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
    }
}
