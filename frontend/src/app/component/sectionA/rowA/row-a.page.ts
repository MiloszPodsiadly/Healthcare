import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type Metric = { value: number | null; goal: number | null; unit: string };
type TodayDto = {
  date: string; steps: Metric; water: Metric; sleep: Metric; mood: Metric;
};

@Component({
  standalone: true,
  selector: 'app-row-a',
  imports: [CommonModule],
  templateUrl: './row-a.page.html',
  styleUrls: ['./row-a.page.css']
})
export class RowAPage implements OnInit {
  private http = inject(HttpClient);

  loading = false;
  data: TodayDto | null = null;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.http.get<TodayDto>('/api/dashboard/today', { withCredentials: true })
      .subscribe({
        next: d => { this.data = d; this.loading = false; },
        error: _ => { this.loading = false; }
      });
  }

  pct(v?: number | null, g?: number | null) {
    if (!v || !g || g <= 0) return 0;
    return Math.min(100, Math.round((v / g) * 100));
  }
}
