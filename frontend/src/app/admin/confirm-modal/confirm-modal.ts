import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.css']
})
export class ConfirmModal implements OnInit {
  @Input() title: string = '';
  @Input() message: string = '';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit() {
    console.log('[ConfirmModal] ngOnInit called');
    console.log('[ConfirmModal] Title:', this.title, 'Message:', this.message);
  }

  onConfirm() {
    console.log('[ConfirmModal] Confirm button clicked');
    this.confirm.emit();
  }

  onCancel() {
    console.log('[ConfirmModal] Cancel button clicked');
    this.cancel.emit();
  }
}
