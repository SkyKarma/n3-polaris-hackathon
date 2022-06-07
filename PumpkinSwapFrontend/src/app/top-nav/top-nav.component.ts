import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletDialogComponent } from '../wallet/wallet-dialog/wallet-dialog.component';
import { WalletProviderService } from '../wallet/wallet-provider/wallet-provider.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {

  constructor(private dialog: MatDialog,
    public walletProvider: WalletProviderService) { }

  ngOnInit(): void {
  }

  openWalletDialog()
  {
    this.dialog.open(WalletDialogComponent, {panelClass: "custom-modalbox"});
  }

}
