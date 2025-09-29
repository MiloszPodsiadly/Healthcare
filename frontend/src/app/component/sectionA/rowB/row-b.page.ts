import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const GH_JSON =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const GH_IMG_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

type RawExercise = {
  id: string;
  name: string;
  force?: string;
  level?: string;
  mechanic?: string;
  equipment?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions?: string[];
  category?: string;
  images?: string[];
};

type ExerciseView = {
  id: string;
  name: string;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  secondaryMuscles: string[];
  instructions: string[];
  image?: string;
};

const LS_FAV = 'rowB_fav';

const norm = (s?: string) => (s ?? '').toLowerCase().trim();

@Component({
  selector: 'app-row-b-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './row-b.page.html',
  styleUrls: ['./row-b.page.css'],
  encapsulation: ViewEncapsulation.None
})
export class RowBPageComponent implements OnInit {

  q = '';
  bodyPart = '';
  equipment = '';
  pageSize = 10;

  page = 1;
  totalPages = 1;

  loading = false;
  error = '';

  private all: ExerciseView[] = [];
  private filtered: ExerciseView[] = [];

  results: ExerciseView[] = [];

  favorites: Record<string, true> = {};

  sourceLink = 'https://github.com/yuhonas/free-exercise-db';

  private debounceTimer: any = null;

  async ngOnInit() {
    this.loadFav();
    await this.ensureDataLoaded();
    this.search();
  }

  private async ensureDataLoaded() {
    if (this.all.length) return;
    this.loading = true;
    this.error = '';

    try {
      const res = await fetch(GH_JSON, { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const raw: RawExercise[] = await res.json();

      this.all = raw.map((r) => {
        const primary = r.primaryMuscles?.[0] || '';
        const img = r.images?.[0]
          ? this.imageUrl(r.images[0])
          : undefined;

        return {
          id: r.id,
          name: r.name,
          bodyPart: primary,
          target: r.secondaryMuscles?.[0],
          equipment: r.equipment,
          secondaryMuscles: r.secondaryMuscles ?? [],
          instructions: r.instructions ?? [],
          image: img
        };
      });
    } catch (e: any) {
      console.error(e);
      this.error = 'Failed to download exercises from GitHub.';
      this.all = [];
    } finally {
      this.loading = false;
    }
  }

  private imageUrl(path: string): string {
    return GH_IMG_BASE + encodeURI(path);
  }

  search() {
    const q = norm(this.q);
    const bp = norm(this.bodyPart);
    const eq = norm(this.equipment);

    let list = this.all;

    if (q) {
      list = list.filter((x) =>
        (x.name + ' ' + (x.bodyPart ?? '') + ' ' + (x.target ?? ''))
          .toLowerCase()
          .includes(q)
      );
    }
    if (bp) {
      list = list.filter((x) => norm(x.bodyPart).includes(bp));
    }
    if (eq) {
      list = list.filter((x) => norm(x.equipment).includes(eq));
    }

    this.filtered = list;
    this.page = 1;
    this.updatePage();
  }

  onFiltersChanged() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.search(), 250);
  }

  clearFilters() {
    this.q = '';
    this.bodyPart = '';
    this.equipment = '';
    this.pageSize = 10;
    this.search();
  }

  setPage(p: number) {
    this.page = Math.max(1, Math.min(this.totalPages, p));
    this.updatePage();
    const el = document.querySelector('.ex-list');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private updatePage() {
    const total = this.filtered.length;
    this.totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.results = this.filtered.slice(start, end);
  }

  private loadFav() {
    try {
      this.favorites = JSON.parse(localStorage.getItem(LS_FAV) || '{}') || {};
    } catch {
      this.favorites = {};
    }
  }
  private saveFav() {
    localStorage.setItem(LS_FAV, JSON.stringify(this.favorites));
  }
  isFav(id: string) {
    return !!this.favorites[id];
  }
  toggleFav(ex: ExerciseView) {
    if (this.isFav(ex.id)) {
      delete this.favorites[ex.id];
    } else {
      this.favorites[ex.id] = true;
    }
    this.saveFav();
  }
}
