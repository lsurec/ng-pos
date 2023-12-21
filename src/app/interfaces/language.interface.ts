export interface LanguageInterface {
    names: Name[];
    lang: string;
    reg: string;
}

export interface Name {
    lrCode: string;
    name: string;
}

export interface MensajesInterface {
    lrCode: string;
    value: string;
}