import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TokenService } from '../../services/interface/token/token.service';
import { NotTrustedDialogComponent } from '../not-trusted-dialog/not-trusted-dialog.component';

@Component({
  selector: 'app-token-select-dialog',
  templateUrl: './token-select-dialog.component.html',
  styleUrls: ['./token-select-dialog.component.scss']
})
export class TokenSelectDialogComponent implements OnInit {

  loading: boolean = false;

  @Output() tokenEmitter = new EventEmitter<{ symbol: string, scriptHash: string, decimals: number }>();

  trustedTokens: { symbol: string, scriptHash: string, decimals: number }[] = []

  constructor(private service: TokenService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.trustedTokens = this.service.common;
  }

  search(input)
  {
    var value = (input as HTMLInputElement).value;
    this.trustedTokens = this.service.common.filter(e => 
        e.symbol.toLocaleLowerCase().includes(value.toLocaleLowerCase()) 
        || e.scriptHash.toLocaleLowerCase().includes(value.toLocaleLowerCase()));

    if(this.trustedTokens.length === 0 && value.length === 42)
    {
      this.loading = true;
      this.service.getToken(value)
        .then(e => this.trustedTokens.push(e))
        .then(e => this.dialog.open(NotTrustedDialogComponent, { disableClose: true }))
        .finally(() => this.loading = false);
    }
  }

  select(token: string)
  {
    this.tokenEmitter.emit(this.trustedTokens.filter(e => e.scriptHash === token)[0]);
  }
}

