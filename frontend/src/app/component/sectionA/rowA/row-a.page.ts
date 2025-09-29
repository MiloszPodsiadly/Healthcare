import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

type State = {
  steps: number; stepsGoal: number;
  water: number; waterGoal: number;
  sleep: number; sleepGoal: number;
  exercise: number; exerciseGoal: number;
  calories: number; caloriesGoal: number;
  mood?: number; moodNote?: string;
  lastUpdated?: string;       // YYYY-MM-DD
  lastArchivedDate?: string;  // YYYY-MM-DD
};

type HistoryEntry = {
  date: string;
  steps: number; water: number; sleep: number; exercise: number; calories: number;
  mood?: number; moodNote?: string;
};

const LS_STATE = 'rowA';
const LS_HISTORY = 'rowHistory';

type GoalKey =
  | 'stepsGoal'
  | 'waterGoal'
  | 'sleepGoal'
  | 'exerciseGoal'
  | 'caloriesGoal';

@Component({
  selector: 'app-row-a-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './row-a.page.html',
  styleUrls: ['./row-a.page.css'],
  encapsulation: ViewEncapsulation.None
})
export class RowAPageComponent implements OnInit, OnDestroy {

  state: State = {
    steps: 6542, stepsGoal: 10000,
    water: 1.2, waterGoal: 2.5,
    sleep: 7.5, sleepGoal: 8,
    exercise: 45, exerciseGoal: 60,
    calories: 1450, caloriesGoal: 2200,
    mood: undefined, moodNote: '',
    lastUpdated: undefined,
    lastArchivedDate: undefined
  };

  nextResetCountdown = '';
  private midnightTimer: any = null;
  private tickTimer: any = null;

  // ===== Modal state =====
  _modal = {
    open: false,
    title: '',
    label: '',
    value: 0,
    step: 1,
    min: 0,
    max: Number.POSITIVE_INFINITY,
    decimals: 0,
    onConfirm: (v:number)=>{}
  };

  // listen changes from other tabs
  private onStorage = (ev: StorageEvent) => {
    if (ev.key === LS_STATE) {
      try {
        const s = JSON.parse(ev.newValue || '{}');
        this.state.lastArchivedDate = s?.lastArchivedDate;
      } catch {}
    }
  };

  ngOnInit(): void {
    const raw = localStorage.getItem(LS_STATE);
    if (raw) { try { this.state = { ...this.state, ...JSON.parse(raw) }; } catch {} }

    this.ensureDateConsistency();
    this.scheduleMidnightJob();
    this.startTick();

    window.addEventListener('storage', this.onStorage);
    window.addEventListener('keydown', this.handleEsc, { passive: true });
  }

  ngOnDestroy(): void {
    clearTimeout(this.midnightTimer);
    clearInterval(this.tickTimer);
    window.removeEventListener('storage', this.onStorage);
    window.removeEventListener('keydown', this.handleEsc);
  }

  /* ================= Modal helpers ================= */
  private openNumberModal(opts: {
    title: string; label: string; value: number;
    step?: number; min?: number; max?: number; decimals?: number;
    onConfirm: (v:number)=>void;
  }){
    this._modal.open = true;
    this._modal.title = opts.title;
    this._modal.label = opts.label;
    this._modal.value = opts.value;
    this._modal.step = opts.step ?? 1;
    this._modal.min = opts.min ?? 0;
    this._modal.max = opts.max ?? Number.POSITIVE_INFINITY;
    this._modal.decimals = opts.decimals ?? 0;
    this._modal.onConfirm = opts.onConfirm;
  }
  hideModal(){ this._modal.open = false; }
  closeModal(ev: Event){ ev.stopPropagation(); this.hideModal(); }
  confirmModal(raw: string){
    let v = Number(raw);
    if (isNaN(v)) v = 0;
    v = Math.max(this._modal.min, Math.min(this._modal.max, v));
    if (this._modal.decimals > 0) {
      const p = Math.pow(10, this._modal.decimals);
      v = Math.round(v * p) / p;
    } else {
      v = Math.round(v);
    }
    this._modal.onConfirm(v);
    this.hideModal();
  }
  private handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && this._modal.open) this.hideModal(); };

  /* ================= History ================= */
  private loadHistory(): HistoryEntry[] {
    try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); } catch { return []; }
  }
  private saveHistory(list: HistoryEntry[]) {
    localStorage.setItem(LS_HISTORY, JSON.stringify(list));
  }

  /** save & reset; overwrite entry with the same date (no duplicates) */
  private archiveAndReset(archiveAsDate: string) {
    const entry: HistoryEntry = {
      date: archiveAsDate,
      steps: this.state.steps,
      water: this.state.water,
      sleep: this.state.sleep,
      exercise: this.state.exercise,
      calories: this.state.calories,
      mood: this.state.mood,
      moodNote: this.state.moodNote
    };

    const history = this.loadHistory().filter(h => h.date !== archiveAsDate);
    history.unshift(entry);
    this.saveHistory(history);

    // reset
    this.state.steps = 0;
    this.state.water = 0;
    this.state.sleep = 0;
    this.state.exercise = 0;
    this.state.calories = 0;
    this.state.mood = undefined;
    this.state.moodNote = '';
    this.state.lastUpdated = this.today();
    this.state.lastArchivedDate = archiveAsDate;
    this.persist();
  }

  private ensureDateConsistency() {
    const today = this.today();
    const last = this.state.lastUpdated ?? today;
    if (last === today) { this.state.lastUpdated = today; this.persist(); return; }
    this.archiveAndReset(last);
  }

  private scheduleMidnightJob() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    const ms = next.getTime() - now.getTime();
    this.midnightTimer = setTimeout(() => {
      const yesterday = this.offsetDate(-1);
      if (this.state.lastArchivedDate !== yesterday) {
        this.archiveAndReset(yesterday);
      } else {
        this.state.lastUpdated = this.today();
        this.persist();
      }
      this.scheduleMidnightJob();
    }, ms);
  }

  private startTick() {
    const compute = () => {
      const now = new Date();
      const next = new Date(now); next.setHours(24,0,0,0);
      const diff = next.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      this.nextResetCountdown = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };
    compute();
    this.tickTimer = setInterval(compute, 1000);
  }

  /* ================= Helpers ================= */
  private today(): string { return new Date().toISOString().slice(0,10); }
  private offsetDate(days: number): string { const d = new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
  private persist() { localStorage.setItem(LS_STATE, JSON.stringify(this.state)); }
  pct(value: number, goal: number): number {
    const p = (value / goal) * 100;
    return !isFinite(p) ? 0 : Math.max(0, Math.min(100, p));
  }

  /* ================= Goals ================= */
  changeGoal(key: GoalKey, delta: number){
    const current = Number(this.state[key] ?? 0);
    const next = Math.max(0, +(current + delta).toFixed(2));
    (this.state as any)[key] = next;
    this.state.lastUpdated = this.today();
    this.persist();
  }
  editGoal(key: GoalKey){
    const current = Number(this.state[key] ?? 0);
    const isDecimal = key === 'waterGoal' || key === 'sleepGoal';
    const label =
      key==='stepsGoal'    ? 'Set daily steps goal:' :
        key==='waterGoal'    ? 'Set daily water goal (L):' :
          key==='sleepGoal'    ? 'Set daily sleep goal (h):' :
            key==='exerciseGoal' ? 'Set daily exercise goal (min):' :
              'Set daily calories goal (kcal):';

    this.openNumberModal({
      title: 'Edit goal',
      label,
      value: current,
      step: isDecimal ? 0.25 : 1,
      decimals: isDecimal ? 2 : 0,
      onConfirm: (v:number) => {
        (this.state as any)[key] = v;
        this.state.lastUpdated = this.today();
        this.persist();
      }
    });
  }

  /* ================= Day values ================= */
  addSteps(a:number){ this.state.steps=Math.max(0,this.state.steps+a); this.state.lastUpdated=this.today(); this.persist(); }
  editSteps(){
    this.openNumberModal({
      title: 'Edit steps',
      label: 'Set steps:',
      value: this.state.steps,
      step: 100,
      onConfirm: (v)=>{ this.state.steps=Math.max(0, Math.round(v)); this.state.lastUpdated=this.today(); this.persist(); }
    });
  }

  addWater(a:number){ this.state.water=Math.max(0,+(this.state.water+a).toFixed(2)); this.state.lastUpdated=this.today(); this.persist(); }
  editWater(){
    this.openNumberModal({
      title: 'Edit water',
      label: 'Set the amount of water (L):',
      value: this.state.water,
      step: 0.1,
      decimals: 2,
      onConfirm: (v)=>{ this.state.water=Math.max(0, +(+v).toFixed(2)); this.state.lastUpdated=this.today(); this.persist(); }
    });
  }

  editSleep(){
    this.openNumberModal({
      title: 'Edit sleep',
      label: 'How long did you sleep? (h):',
      value: this.state.sleep,
      step: 0.5,
      decimals: 2,
      onConfirm: (v)=>{ this.state.sleep=Math.max(0, +(+v).toFixed(2)); this.state.lastUpdated=this.today(); this.persist(); }
    });
  }

  addExercise(a:number){ this.state.exercise=Math.max(0,this.state.exercise+a); this.state.lastUpdated=this.today(); this.persist(); }
  editExercise(){
    this.openNumberModal({
      title: 'Edit exercises',
      label: 'Set exercise minutes:',
      value: this.state.exercise,
      step: 5,
      onConfirm: (v)=>{ this.state.exercise=Math.max(0, Math.round(v)); this.state.lastUpdated=this.today(); this.persist(); }
    });
  }

  addCalories(a:number){ this.state.calories=Math.max(0,this.state.calories+a); this.state.lastUpdated=this.today(); this.persist(); }
  editCalories(){
    this.openNumberModal({
      title: 'Edit calories',
      label: 'Set calories (kcal):',
      value: this.state.calories,
      step: 50,
      onConfirm: (v)=>{ this.state.calories=Math.max(0, Math.round(v)); this.state.lastUpdated=this.today(); this.persist(); }
    });
  }

  setMood(val:number){ this.state.mood = this.state.mood===val ? undefined : val; this.state.lastUpdated=this.today(); this.persist(); }
  onMoodNoteInput(ev:Event){ const value=(ev.target as HTMLTextAreaElement).value; this.state.moodNote=value; this.state.lastUpdated=this.today(); this.persist(); }

  /* ================= Archiving ================= */
  archiveNow(){
    const today = this.today();
    try {
      const raw = localStorage.getItem(LS_STATE);
      if (raw) {
        const s = JSON.parse(raw);
        this.state.lastArchivedDate = s?.lastArchivedDate;
      }
    } catch {}

    const history = this.loadHistory();
    const existsToday = history.some(h => h.date === today);
    if (existsToday) {
      const ok = confirm('There is already an entry for today. Overwrite it with the current values?');
      if (!ok) return;
    }

    this.archiveAndReset(today);
    alert('The current day has been archived and the counters have been reset to zero ✔');
  }
}
