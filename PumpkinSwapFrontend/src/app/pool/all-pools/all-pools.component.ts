import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/services/interface/token/token.service';
import { WalletProviderService } from 'src/app/wallet/wallet-provider/wallet-provider.service';

@Component({
  selector: 'app-all-pools',
  templateUrl: './all-pools.component.html',
  styleUrls: ['./all-pools.component.scss']
})
export class AllPoolsComponent implements OnInit {
  loading: boolean = true;
  pools: { totalSupply: number, symbolOne: string, symbolTwo: string, tokenA: string, tokenB: string, poolAddress: string }[] = [];

  constructor(
    private walletProvider: WalletProviderService,
    private tokenService: TokenService) { }

  ngOnInit(): void {
    this.walletProvider.walletInitialized.subscribe(init =>
      {
        if(init)
        {
          this.walletProvider
          .Wallet()
          .getAllExchangePair()
          .then(async ep =>
            {
              await Promise.all(ep.map(async (element) =>
              {
                await this.tokenService
                .getToken(element.poolAddress)
                .then(async token => 
                  {
                    if(token.symbol.startsWith("PLP"))
                        {
                          var splittedSymbol = token.symbol.split("-");

                          await this.walletProvider
                            .Wallet()
                            .getTotalSupply(element.poolAddress)
                            .then(supply =>
                              {
                                this.pools.push(
                                  {
                                    poolAddress: element.poolAddress,
                                    tokenA: element.tokenA,
                                    tokenB: element.tokenB,
                                    symbolTwo: splittedSymbol.pop(),
                                    symbolOne: splittedSymbol.pop(),
                                    totalSupply: this.getTotalSupplyWithDecimals(supply, token.decimals)
                                  });
                              })
                        }
                  })
              }))
            })
          .finally(() => this.loading = false);
        }
      });
  }

  private getTotalSupplyWithDecimals(num: string, decimals: number) : number
  {
    var final = "1";
    for (let index = 0; index < decimals; index++) {
      final = final + "0";
    }
    return Number(parseFloat(num) / parseFloat(final));
  }
}