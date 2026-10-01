import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl } from '@angular/forms';
import { ErrorWrapper } from '../models/common/api-wrapper.models';

export interface ApiErrorPresentation {
  message: string;
  fieldErrors: Record<string, string>;
}

const CODE_MESSAGES: Record<string, string> = {
  USER_ALREADY_EXIST: 'Un compte utilise déjà cette adresse e-mail.',
  USER_NOT_FOUND: 'Cet utilisateur est introuvable.',
  PRODUCT_NOT_FOUND: 'Ce produit est introuvable.',
  PRODUCT_VARIANT_NOT_FOUND: 'Cette variante de produit est introuvable.',
  PRODUCT_VARIANT_SKU_ALREADY_EXIST: 'Ce code article existe déjà pour une autre variante.',
  CATEGORY_NOT_FOUND: 'Cette catégorie est introuvable.',
  CATEGORY_ALREADY_EXIST_WITH_NAME: 'Une catégorie porte déjà ce nom.',
  CART_NOT_FOUND: 'Votre panier est introuvable. Actualisez la page puis réessayez.',
  CART_EMPTY: 'Votre panier est vide.',
  INVALID_CART_ITEM: 'Un article de votre panier n’est plus valide. Actualisez la page.',
  PRODUCT_INACTIVE: 'Ce produit n’est plus disponible.',
  OUT_OF_STOCK: 'Ce produit n’est plus disponible dans la quantité demandée.',
  INVALID_ORDER_SWITCH_STATUS: 'Cette commande ne peut pas passer à cet état.',
  IDEMPOTENCY_KEY_REUSED: 'Cette commande est déjà en cours de traitement. Actualisez la page avant de réessayer.',
  INVALID_HIGHLIGHT_LIST_TYPE: 'Le type de sélection mis en avant est invalide.',
  DUPLICATE_PRODUCT_IN_HIGHLIGHT_LIST: 'Un même produit ne peut être sélectionné qu’une fois.',
  HIGHLIGHT_LIST_TOO_LARGE: 'Cette sélection contient trop de produits.',
  STORAGE_ERROR: 'Le fichier n’a pas pu être traité. Vérifiez son format et sa taille.',
  MAX_UPLOAD_SIZE_ERROR: 'Le fichier est trop volumineux.',
  SETUP_NOT_AVAILABLE: 'La configuration initiale n’est plus disponible.',
  UNAUTHENTICATED: 'Votre session a expiré. Connectez-vous pour continuer.',
  FORBIDDEN: 'Vous n’avez pas les droits nécessaires pour effectuer cette action.',
};

const FIELD_LABELS: Record<string, string> = {
  email: 'Adresse e-mail',
  password: 'Mot de passe',
  currentPassword: 'Mot de passe actuel',
  newPassword: 'Nouveau mot de passe',
  firstName: 'Prénom',
  lastName: 'Nom',
  name: 'Nom',
  description: 'Description',
  details: 'Détails',
  shippingInfo: 'Informations de livraison',
  phoneNumber: 'Numéro de téléphone',
  quantity: 'Quantité',
  productId: 'Produit',
  productVariantId: 'Variante de produit',
  productIds: 'Produits sélectionnés',
  categoryIds: 'Catégories',
  sku: 'Code article',
  price: 'Prix',
  stockQuantity: 'Stock',
  size: 'Taille de page',
  page: 'Numéro de page',
  id: 'Identifiant',
  orderId: 'Commande',
  idempotencyKey: 'Clé de commande',
  request: 'Requête',
};

/**
 * Converts the backend ErrorDataWrapper contract into safe French text for the UI.
 * Backend implementation messages are deliberately never exposed for unknown errors.
 */
export function getApiErrorPresentation(error: unknown): ApiErrorPresentation {
  if (!(error instanceof HttpErrorResponse)) {
    return { message: 'Une erreur inattendue est survenue. Veuillez réessayer.', fieldErrors: {} };
  }

  if (error.status === 0) {
    return {
      message: 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.',
      fieldErrors: {},
    };
  }

  const body = isErrorWrapper(error.error) ? error.error : null;
  const fieldErrors = extractFieldErrors(body?.errors);
  const code = body?.messageCode ?? '';

  if (code === 'VALIDATION_ERROR') {
    return {
      message: validationSummary(fieldErrors),
      fieldErrors,
    };
  }

  const codeMessage = CODE_MESSAGES[code];
  if (codeMessage) {
    return { message: codeMessage, fieldErrors };
  }

  return { message: messageForStatus(error.status), fieldErrors };
}

/** Adds API validation errors to matching Angular controls and marks them as touched. */
export function applyApiValidationErrors(form: AbstractControl, error: unknown): boolean {
  const { fieldErrors } = getApiErrorPresentation(error);
  let applied = false;

  for (const [field, message] of Object.entries(fieldErrors)) {
    const control = form.get(field.replace(/\[(\d+)\]/g, '.$1'));
    if (!control) {
      continue;
    }

    control.setErrors({ ...control.errors, server: message });
    control.markAsTouched();
    applied = true;
  }

  return applied;
}

function isErrorWrapper(value: unknown): value is ErrorWrapper {
  return typeof value === 'object' && value !== null;
}

function extractFieldErrors(errors: unknown): Record<string, string> {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0)
      .map(([field, message]) => [field, translateValidationMessage(message)]),
  );
}

function validationSummary(fieldErrors: Record<string, string>): string {
  const details = Object.entries(fieldErrors)
    .slice(0, 3)
    .map(([field, message]) => `${FIELD_LABELS[field] ?? field} : ${message}`);

  return details.length > 0
    ? `Veuillez corriger les informations suivantes : ${details.join(' · ')}`
    : 'Certaines informations saisies ne sont pas valides. Vérifiez le formulaire puis réessayez.';
}

function translateValidationMessage(message: string): string {
  const normalized = message.trim();
  const lowercase = normalized.toLowerCase();

  if (lowercase.includes('must not be blank') || lowercase.includes('is required')) {
    return 'Ce champ est obligatoire.';
  }
  if (lowercase.includes('must be valid') || lowercase.includes('well-formed email')) {
    return 'Saisissez une adresse e-mail valide.';
  }
  if (lowercase.includes('must be at least')) {
    const length = normalized.match(/\d+/)?.[0];
    return length ? `La valeur doit contenir au moins ${length} caractères.` : 'La valeur est trop courte.';
  }
  if (lowercase.includes('must not exceed') || lowercase.includes('less than or equal to')) {
    const limit = normalized.match(/\d+/)?.[0];
    return limit ? `La valeur ne doit pas dépasser ${limit}.` : 'La valeur dépasse la limite autorisée.';
  }
  if (lowercase.includes('must be non-negative')) {
    return 'La valeur ne peut pas être négative.';
  }
  if (lowercase.includes('must be greater than')) {
    return 'La valeur doit être strictement positive.';
  }
  if (lowercase.includes('malformed') || lowercase.includes('invalid value')) {
    return 'La valeur transmise est invalide.';
  }

  return normalized;
}

function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'La demande est invalide. Vérifiez les informations saisies puis réessayez.';
    case 401:
      return 'Votre adresse e-mail ou votre mot de passe est incorrect.';
    case 403:
      return 'Vous n’avez pas les droits nécessaires pour effectuer cette action.';
    case 404:
      return 'La ressource demandée est introuvable ou n’est plus disponible.';
    case 409:
      return 'Cette action entre en conflit avec des données existantes. Actualisez la page puis réessayez.';
    case 413:
      return 'Le fichier envoyé est trop volumineux.';
    case 429:
      return 'Trop de demandes ont été envoyées. Patientez quelques instants avant de réessayer.';
    default:
      return 'Le serveur a rencontré un problème. Veuillez réessayer dans quelques instants.';
  }
}
