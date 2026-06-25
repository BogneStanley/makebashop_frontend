import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import {
  Category,
  CategoryService,
} from '../../../core/services/category.service';

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
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryList {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories = this.categoryService.getCategories();

  isFormDrawerOpen = signal(false);
  isDeleteDialogOpen = signal(false);
  editingCategory = signal<Category | null>(null);
  categoryToDelete = signal<Category | null>(null);

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

  openCreateDrawer(): void {
    this.editingCategory.set(null);
    this.categoryForm.reset({ name: '', description: '' });
    this.isFormDrawerOpen.set(true);
  }

  openEditDrawer(category: Category): void {
    this.editingCategory.set(category);
    this.categoryForm.reset({
      name: category.name,
      description: category.description,
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

    if (this.categoryForm.invalid) {
      return;
    }

    const input = this.categoryForm.getRawValue();
    const editing = this.editingCategory();

    if (editing) {
      this.categoryService.updateCategory(editing.id, input);
    } else {
      this.categoryService.createCategory(input);
    }

    this.closeFormDrawer();
  }

  openDeleteDialog(category: Category): void {
    this.categoryToDelete.set(category);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.categoryToDelete.set(null);
  }

  confirmDelete(): void {
    const category = this.categoryToDelete();
    if (category) {
      this.categoryService.deleteCategory(category.id);
    }
    this.closeDeleteDialog();
  }

  formDrawerTitle(): string {
    return this.editingCategory() ? 'Modifier la catégorie' : 'Nouvelle catégorie';
  }
}
