import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type HistoryEntry = {
  date: string;
  steps: number;
  water: number;
  sleep: number;
  exercise: number;
  calories: number;
  stepsGoal?: number;
  waterGoal?: number;
  sleepGoal?: number;
  exerciseGoal?: number;
  caloriesGoal?: number;
  mood?: number;
  moodNote?: string;
};


const LS_HISTORY = 'rowHistory';
const LS_STATE   = 'rowA';

@Component({
  selector: 'app-row-c-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './row-c.page.html',
  styleUrls: ['./row-c.page.css'],
  encapsulation: ViewEncapsulation.None
})
export class RowCPageComponent implements OnDestroy {

  historyAll: HistoryEntry[] = [];

  q = '';
  from?: string;
  to?: string;
  sortDir: 'desc'|'asc' = 'desc';
  page = 1;
  pageSize = 8;

  lastArchivedDate?: string;
  nextResetCountdown = '';
  private tickTimer: any = null;

  constructor(){
    this.load();
    this.readStatus();
    this.startTick();
  }

  ngOnDestroy(): void { clearInterval(this.tickTimer); }

  private load() {
    try { this.historyAll = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); }
    catch { this.historyAll = []; }
  }
  private readStatus(){
    try {
      const s = JSON.parse(localStorage.getItem(LS_STATE) || '{}');
      this.lastArchivedDate = s?.lastArchivedDate;
    } catch {}
  }

  get filtered(): HistoryEntry[] {
    let list = [...this.historyAll];

    if (this.from) list = list.filter(x => x.date >= this.from!);
    if (this.to)   list = list.filter(x => x.date <= this.to!);

    if (this.q.trim()) {
      const s = this.q.trim().toLowerCase();
      list = list.filter(x =>
        x.date.toLowerCase().includes(s) ||
        (x.moodNote ?? '').toLowerCase().includes(s)
      );
    }

    list.sort((a,b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    if (this.sortDir === 'desc') list.reverse();

    return list;
  }

  get totalPages(){ return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged(): HistoryEntry[] {
    const start = (this.page-1)*this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  setPage(p:number){
    this.page = Math.min(this.totalPages, Math.max(1, p));
    const el = document.querySelector('.timeline'); if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }

  clearFilters(){ this.q=''; this.from=undefined; this.to=undefined; this.sortDir='desc'; this.page=1; }

  private clearLastArchivedIf(date: string) {
    try {
      const raw = localStorage.getItem(LS_STATE);
      if (!raw) return;
      const st = JSON.parse(raw);
      if (st?.lastArchivedDate === date) {
        delete st.lastArchivedDate;
        localStorage.setItem(LS_STATE, JSON.stringify(st));
        this.lastArchivedDate = undefined;
      }
    } catch {}
  }

  private clearAnyLastArchived(){
    try {
      const raw = localStorage.getItem(LS_STATE);
      if (!raw) return;
      const st = JSON.parse(raw);
      if (st?.lastArchivedDate) {
        delete st.lastArchivedDate;
        localStorage.setItem(LS_STATE, JSON.stringify(st));
        this.lastArchivedDate = undefined;
      }
    } catch {}
  }

  clearAll(){
    if(confirm('Be sure to delete the entire archive?')) {
      localStorage.setItem(LS_HISTORY, '[]');
      this.historyAll = [];
      this.page = 1;
      this.clearAnyLastArchived();
    }
  }

  removeEntry(date:string){
    if(!confirm(`Delete entry from ${date}?`)) return;

    this.historyAll = this.historyAll.filter(x => x.date !== date);
    localStorage.setItem(LS_HISTORY, JSON.stringify(this.historyAll));

    this.clearLastArchivedIf(date);

    if (this.page > this.totalPages) this.page = this.totalPages;
  }

  exportCSV(){
    const headers = [
      'date','steps','water','sleep','exercise','calories',
      'stepsGoal','waterGoal','sleepGoal','exerciseGoal','caloriesGoal',
      'mood','moodNote'
    ];

    const rows = this.filtered.map(h=>[
      h.date,
      h.steps, h.water, h.sleep, h.exercise, h.calories,
      h.stepsGoal ?? 10000,
      h.waterGoal ?? 2.5,
      h.sleepGoal ?? 8,
      h.exerciseGoal ?? 60,
      h.caloriesGoal ?? 2200,
      h.mood ?? '',
      (h.moodNote ?? '').replace(/\n/g,' ')
    ]);

    const csv = [headers, ...rows].map(r=>r.join(';')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'history-rowA.csv'; a.click();
    URL.revokeObjectURL(url);
  }


  pct(v:number,g:number){ const p=(v/g)*100; return Math.max(0,Math.min(100,isFinite(p)?p:0)); }
  moodEmoji(m?:number){ return m===1?'😟':m===2?'🙂':m===3?'😊':m===4?'😋':m===5?'🤩':'—'; }
  moodLabel(m?:number){ return m===1?'sad':m===2?'Not great':m===3?'OK':m===4?'Content':m===5?'Great':'Lack'; }

  private startTick(){
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
}
