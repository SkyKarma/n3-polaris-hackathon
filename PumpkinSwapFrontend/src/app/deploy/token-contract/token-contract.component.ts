import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { WalletProviderService } from 'src/app/wallet/wallet-provider/wallet-provider.service';

@Component({
  selector: 'app-token-contract',
  templateUrl: './token-contract.component.html',
  styleUrls: ['./token-contract.component.scss']
})
export class TokenContractComponent implements OnInit {

  loading: boolean = false;
  newContractHash: string = "";
  deployed: boolean = false;

  deployFee = "";

  token = this.fb.group({
    name: [''],
    symbol: [''],
    decimals: [8],
    supply: ['', ],
    author: [''],
    email:[''],
    description: [''],
  });

  constructor(private fb: FormBuilder,
    private walletProvider: WalletProviderService) { }

  ngOnInit(): void {
    this.walletProvider
      .walletInitialized
      .subscribe(initialised => {
        if(initialised)
        {
          this.walletProvider
            .Wallet()
            .getTokenDeployFee()
            .then(fee => 
              {
                this.deployFee = fee;
              });
        }
      })
  }


  deployToken()
  {
      if(this.walletProvider.walletInitialized.value)
      this.walletProvider
        .Wallet()
        .deployTokenContract(
            this.token.get("name").value,
            this.token.get("author").value,
            this.token.get("email").value,
            this.token.get("description").value,
            this.token.get("symbol").value,
            this.token.get("decimals").value,
            this.addZeros(this.token.get('supply').value, this.token.get("decimals").value))
            .then(txId => 
              {
                this.setGetContractAddressPooling(txId);
                this.deployed = true;
              });
  }

  private setGetContractAddressPooling(txId: string)
  {
    this.loading = true;
    let contractTimeInterval = interval(3000)
    .pipe(
      startWith(0),
      switchMap(() => this.walletProvider.Wallet().getTokenContractDeployed(txId)))
      .subscribe(result => 
        {
          if(result != "")
          {
            this.newContractHash = result;
            this.loading = false;
          }
        });
  }

  private addZeros(num: string, decimals: number)
  {
    var final = "1";
    for (let index = 0; index < decimals; index++) {
      final = final + "0";
    }
    return parseFloat(num) * parseFloat(final);
  }
}
