import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { TreeComponent } from '../shared/components/tree/tree.component';
import { DisplayComponent } from '../shared/components/display/display.component';
import { Report } from '../shared/interfaces/report';
import { TreeNode } from '../shared/interfaces/tree-node';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.css'],
})
export class DebugComponent {
  @ViewChild(TreeComponent) treeComponent!: TreeComponent;
  @Output() openCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  currentView: any = {};

  constructor() {}

  addReportToTree(newReport: Report): void {
    this.treeComponent.handleChange(newReport);
  }

  showReportInDisplay(currentReport: TreeNode): void {
    this.displayComponent.closeReport(false, -1);
    setTimeout(() => {
      this.displayComponent.showReport(currentReport);
    }, 1000);
  }

  closeEntireTree(): void {
    this.displayComponent.closeReport(false, -1);
  }

  closeDisplayReport(): void {
    this.displayComponent.closeReport(false, -1);
  }

  closeReport(currentReport: TreeNode): void {
    this.treeComponent.removeNode(currentReport);
  }

  openCompareReport(reports: any) {
    this.openCompareReportsEvent.emit(reports);
  }

  changeView(view: any) {
    this.currentView = view;
  }
}
