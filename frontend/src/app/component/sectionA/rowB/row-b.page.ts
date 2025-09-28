import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Metric = { value: number | null; goal: number | null; unit: string };
type TodayDto = {
  date: string;
  water?: Metric;
  calories?: Metric;   // daily calories eaten
  activity?: Metric;   // daily activity minutes
  mood?: Metric;       // optional, if you ever aggregate mood count
};

type WaterEntry = { id: number; value: number; createdAt?: string };

@Component({
  standalone: true,
  selector: 'app-row-b',
  imports: [CommonModule, FormsModule],
  templateUrl: './row-b.page.html',
  styleUrls: ['./row-b.page.css']
})
export class RowBPage implements OnInit {
  private http = inject(HttpClient);
  private API = '/api';

  // UI state
  loading = false;
  posting = false;
  toast: string | null = null;

  // WATER
  waterToday = 0;
  waterGoal: number | null = null;
  entries: WaterEntry[] = [];
  customMl: number | null = null;

  // MOOD
  moodValue: 1|2|3|4|5 | null = null;
  moodNote = '';
  moodToday = 0;
  moodGoal: number | null = null; // optional, kept for symmetry

  // MEAL (kcal)
  mealType: 'BREAKFAST'|'LUNCH'|'DINNER'|'SNACK' = 'BREAKFAST';
  mealName = '';
  mealKcal: number | null = null;
  mealToday = 0;
  mealGoal: number | null = null;

  // ACTIVITY (minutes)
  exName = '';
  exMinutes = 5;
  activityToday = 0;
  activityGoal: number | null = null;

  ngOnInit(): void {
    this.loadSummary();
    this.loadWaterEntries();
  }

  // ===== LOAD =====
  private loadSummary() {
    this.loading = true;
    this.http.get<TodayDto>(`${this.API}/dashboard/today`, { withCredentials: true })
      .subscribe({
        next: d => {
          // water
          this.waterToday = d.water?.value ?? 0;
          this.waterGoal  = d.water?.goal  ?? null;

          // meals (kcal)
          this.mealToday = d.calories?.value ?? 0;
          this.mealGoal  = d.calories?.goal  ?? null;

          // activity (minutes)
          this.activityToday = d.activity?.value ?? 0;
          this.activityGoal  = d.activity?.goal  ?? null;

          // mood aggregated (optional)
          this.moodToday = d.mood?.value ?? 0;
          this.moodGoal  = d.mood?.goal  ?? null;

          this.loading = false;
        },
        error: _ => { this.loading = false; }
      });
  }

  private loadWaterEntries() {
    this.http.get<WaterEntry[]>(
      `${this.API}/habits`,
      { params: { type: 'WATER', date: 'today' }, withCredentials: true }
    ).subscribe({
      next: rows => { this.entries = rows ?? []; },
      error: _ => { /* fine if endpoint not implemented */ }
    });
  }

  // ===== PROGRESS helper =====
  pct(value?: number | null, goal?: number | null): number {
    if (!value || !goal || goal <= 0) return 0;
    const p = Math.round((value / goal) * 100);
    return Math.max(0, Math.min(100, p));
  }

  // ===== WATER =====
  addWater(ml: number) {
    if (this.posting) return;
    this.posting = true;

    const req$ = ml === 250
      ? this.http.post<number>(`${this.API}/habits/water/250`, null, { withCredentials: true })
      : this.http.post<number>(`${this.API}/habits`, { type: 'WATER', value: ml }, { withCredentials: true });

    req$.subscribe({
      next: id => {
        this.waterToday += ml;
        this.entries.unshift({ id, value: ml, createdAt: new Date().toISOString() });
        this.posting = false;
        this.showToast(`Added ${ml} ml 💧`);
      },
      error: _ => {
        this.posting = false;
        this.showToast('Could not add water');
      }
    });
  }

  addCustomWater() {
    const ml = Number(this.customMl);
    if (!ml || ml <= 0 || ml > 5000) {
      this.showToast('Enter 1–5000 ml');
      return;
    }
    this.addWater(ml);
    this.customMl = null;
  }

  removeWater(entry: WaterEntry) {
    this.http.delete(`${this.API}/habits/${entry.id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.entries = this.entries.filter(e => e.id !== entry.id);
          this.waterToday = Math.max(0, this.waterToday - entry.value);
          this.showToast('Entry removed');
        },
        error: _ => this.showToast('Could not remove entry')
      });
  }

  // ===== MOOD =====
  setMood(v: 1|2|3|4|5) { this.moodValue = v; }

  saveMood() {
    if (!this.moodValue) return;
    this.posting = true;
    this.http.post(`${this.API}/mood`, {
      value: this.moodValue, note: this.moodNote?.trim() || null
    }, { withCredentials: true }).subscribe({
      next: _ => {
        this.posting = false;
        this.moodNote = '';
        this.showToast('Mood saved 😊');
      },
      error: _ => {
        this.posting = false;
        this.showToast('Could not save mood');
      }
    });
  }

  // ===== MEAL (kcal) =====
  saveMeal(){
    if (!this.mealName?.trim()) return;
    this.posting = true;
    const kcal = this.mealKcal ?? 0;

    this.http.post(`${this.API}/meals`, {
      type: this.mealType, name: this.mealName.trim(), kcal
    }, { withCredentials: true }).subscribe({
      next: _ => {
        this.posting = false;
        this.mealToday += kcal;
        this.mealName = ''; this.mealKcal = null; this.mealType = 'BREAKFAST';
        this.showToast('Meal added 🍽️');
      },
      error: _ => {
        this.posting = false;
        this.showToast('Could not add meal');
      }
    });
  }

  // ===== ACTIVITY (minutes) =====
  decMinutes(step = 5) {
    const v = this.exMinutes - step;
    this.exMinutes = v < 1 ? 1 : v;
  }
  incMinutes(step = 5) {
    const v = this.exMinutes + step;
    this.exMinutes = v > 240 ? 240 : v;
  }

  saveExercise(){
    const name = this.exName?.trim();
    if (!name) return;

    this.posting = true;
    const mins = this.exMinutes;

    this.http.post(`${this.API}/exercises`, { name, minutes: mins }, { withCredentials: true })
      .subscribe({
        next: _ => {
          this.posting = false;
          this.activityToday += mins;
          this.exName = ''; this.exMinutes = 5;
          this.showToast('Activity added 🏃');
        },
        error: _ => {
          this.posting = false;
          this.showToast('Could not add activity');
        }
      });
  }

  // ===== UTIL =====
  private showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = null, 2200);
  }
}
