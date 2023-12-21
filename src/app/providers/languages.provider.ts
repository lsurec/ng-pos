import { LanguageInterface } from "../interfaces/language.interface";

//todos los lenguajes
export const languagesProvider: LanguageInterface[] = [
    {
        names: [
            {
                lrCode: "es-GT",
                name: "Español (Guatemala)"
            },
            {
                lrCode: "en-US",
                name: "Spanish (Guatemala)"
            }
        ],
        lang: "es",
        reg: "GT"
    },
    {
        names: [
            {
                lrCode: "es-GT",
                name: "Ingles (Estados Unidos)"
            },
            {
                lrCode: "en-US",
                name: "English (United States)"
            }
        ],
        lang: "en",
        reg: "US"
    },
]

//Lenguaje por defecto
export const indexDefaultLang : number = 0;