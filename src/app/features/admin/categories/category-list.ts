import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { CategoryResponse } from '../../../core/models/products/product-response.models';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-list',
  imports: [
    ReactiveFormsModule,
    TableModule,
    DrawerModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryList implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories = this.categoryService.categoriesList;
  loading = this.categoryService.isLoading;

  isFormDrawerOpen = signal(false);
  isDeleteDialogOpen = signal(false);
  saving = signal(false);
  deleting = signal(false);
  editingCategory = signal<CategoryResponse | null>(null);
  categoryToDelete = signal<CategoryResponse | null>(null);

  categoryForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  get nameControl() {
    return this.categoryForm.controls.name;
  }

  get descriptionControl() {
    return this.categoryForm.controls.description;
  }

  ngOnInit(): void {
    this.categoryService.loadCategories().subscribe();
  }

  openCreateDrawer(): void {
    this.editingCategory.set(null);
    this.categoryForm.reset({ name: '', description: '' });
    this.isFormDrawerOpen.set(true);
  }

  openEditDrawer(category: CategoryResponse): void {
    this.editingCategory.set(category);
    this.categoryForm.reset({
      name: category.name,
      description: category.description ?? '',
    });
    this.isFormDrawerOpen.set(true);
  }

  closeFormDrawer(): void {
    this.isFormDrawerOpen.set(false);
    this.editingCategory.set(null);
    this.categoryForm.reset({ name: '', description: '' });
  }

  saveCategory(): void {
    this.categoryForm.markAllAsTouched();

    if (this.categoryForm.invalid || this.saving()) {
      return;
    }

    const input = this.categoryForm.getRawValue();
    const editing = this.editingCategory();
    const request$ = editing
      ? this.categoryService.updateCategory(editing.id, input)
      : this.categoryService.createCategory(input);

    this.saving.set(true);
    request$.pipe(finalize(() => this.saving.set(false))).subscribe((result) => {
      if (result) {
        this.closeFormDrawer();
      }
    });
  }

  openDeleteDialog(category: CategoryResponse): void {
    this.categoryToDelete.set(category);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.categoryToDelete.set(null);
  }

  confirmDelete(): void {
    const category = this.categoryToDelete();
    if (!category || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.categoryService
      .deleteCategory(category.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe((success) => {
        if (success) {
          this.closeDeleteDialog();
        }
      });
  }

  formDrawerTitle(): string {
    return this.editingCategory() ? 'Modifier la catégorie' : 'Nouvelle catégorie';
  }
}
