import { LanguageInterface } from "../interfaces/language.interface";

//todos los lenguajes
export const languagesProvider: LanguageInterface[] = [
    //español
    {
        names: [
            {
                lrCode: "es-GT", //el idioma donde se muestra
                name: "Español (Guatemala)" //como se muestra
            },
            {
                lrCode: "en-US",
                name: "Spanish (Guatemala)"
            },
            {
                lrCode: "fr-FR",
                name: "Espagnol (Guatemala)"
            },
            {
                lrCode: "de-DE",
                name: "Spanisch (Guatemala)"
            }
        ],
        lang: "es",
        reg: "GT"
    },
    //ingles
    {
        names: [
            {
                lrCode: "es-GT",
                name: "Ingles (Estados Unidos)"
            },
            {
                lrCode: "en-US",
                name: "English (United States)"
            },
            {
                lrCode: "fr-FR",
                name: "Anglais (United States)"
            },
            {
                lrCode: "de-DE",
                name: "Englisch (Vereinigte Staaten)"
            }
        ],
        lang: "en",
        reg: "US"
    },
    //frances
    {
        names: [
            {
                lrCode: "es-GT",
                name: "Francés (Francia)"
            },
            {
                lrCode: "en-US",
                name: "French (France)"
            },
            {
                lrCode: "fr-FR",
                name: "Français (France)"
            },
            {
                lrCode: "de-DE",
                name: "Französisch (Frankreich)"
            }
        ],
        lang: "fr",
        reg: "FR"
    },
    {
        names: [
            {
                lrCode: "es-GT",
                name: "Alemán (Alemania)"
            },
            {
                lrCode: "en-US",
                name: "German (Germany)"
            },
            {
                lrCode: "fr-FR",
                name: "Allemand (Allemagne)"
            },
            {
                lrCode: "de-DE",
                name: "Deutsch (Deutschland)"
            }
        ],
        lang: "de",
        reg: "DE"
    }
]

//Lenguaje por defecto
export const indexDefaultLang: number = 0;