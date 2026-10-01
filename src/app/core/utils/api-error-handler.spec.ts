import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { applyApiValidationErrors, getApiErrorPresentation } from './api-error-handler';

describe('API error handler', () => {
  it('turns backend validation details into an actionable French message', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        errors: { size: 'doit être inférieur ou égal à 100' },
        messageCode: 'VALIDATION_ERROR',
        error: 'Validation error',
      },
    });

    const presentation = getApiErrorPresentation(error);

    expect(presentation.message).toBe(
      'Veuillez corriger les informations suivantes : Taille de page : doit être inférieur ou égal à 100',
    );
    expect(presentation.fieldErrors).toEqual({ size: 'doit être inférieur ou égal à 100' });
  });

  it('uses the error code instead of exposing backend implementation messages', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: {
        errors: 'Email already exists',
        messageCode: 'USER_ALREADY_EXIST',
        error: null,
      },
    });

    expect(getApiErrorPresentation(error).message).toBe('Un compte utilise déjà cette adresse e-mail.');
  });

  it('attaches matching validation errors directly to form controls', () => {
    const form = new FormGroup({ email: new FormControl('') });
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        errors: { email: 'Email must be valid' },
        messageCode: 'VALIDATION_ERROR',
        error: 'Validation error',
      },
    });

    expect(applyApiValidationErrors(form, error)).toBe(true);
    expect(form.controls.email.errors?.['server']).toBe('Saisissez une adresse e-mail valide.');
    expect(form.controls.email.touched).toBe(true);
  });

  it('returns a useful offline message', () => {
    const error = new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') });

    expect(getApiErrorPresentation(error).message).toContain('Impossible de joindre le serveur');
  });
});
