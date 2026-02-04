import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService } from '../../services/plan';

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './history.html'
})
export class HistoryComponent implements OnInit {
    historyRecords: any[] = [];
    loading = true;

    constructor(private planService: PlanService) { }

    async ngOnInit() {
        this.historyRecords = await this.planService.getHistory();
        this.loading = false;
    }

    formatDate(isoString: string): string {
        return new Date(isoString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}
