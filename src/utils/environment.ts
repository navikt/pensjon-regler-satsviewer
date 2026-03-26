export const isProduction = (): boolean =>
    !window.location.hostname.includes('.dev.') &&
    window.location.hostname !== 'localhost';

export const PROD_ENVIRONMENT = 'produksjon';
